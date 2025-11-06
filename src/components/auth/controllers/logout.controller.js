import jwt from "jsonwebtoken";

import UserModel from "../../users/models/user.model.js";
import { ENV } from "../../../config/env.js";

export const logoutController = async (req, res) => {
  try {
    // Check if cookies exist
    if (!req.cookies) {
      return res.status(200).json({
        success: true,
        message: "Logout successful (no active session)",
      });
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logout successful (no refresh token found)",
      });
    }

    try {
      // Decode the token without verification to get user ID
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.id) {
        // Remove refresh token from database
        await UserModel.update(
          { refreshToken: null },
          { where: { id: decoded.id } }
        );
      }

      // Clear the cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (decodeError) {
      // If token is invalid but cookie exists, just clear the cookie
      console.warn("Invalid refresh token during logout:", decodeError);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logout successful (invalid token cleared)",
      });
    }
  } catch (error) {
    console.error("Logout error: ", error);

    // Even if there's an error, try to clear the cookie
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
      });
    } catch (clearError) {
      console.error("Error clearing cookie:", clearError);
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error during logout",
      error: error.message,
    });
  }
};
