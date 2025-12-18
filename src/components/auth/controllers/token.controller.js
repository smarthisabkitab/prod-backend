import jwt from "jsonwebtoken";

import UserModel from "../../../components/users/models/user.model.js";
import SubscriptionModel from "../../../components/subscriptions/models/subscription.model.js";
import { ENV } from "../../../config/env.js";
import { accessTokenGen, refreshTokenGen } from "../helpers/token.gen.js";

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET);

    // Check if token exists in database (optional security measure)
    const user = await UserModel.findOne({
      where: {
        id: decoded.id,
        refreshToken: refreshToken,
      },
      include: [
        {
          model: SubscriptionModel,
          as: "subscription",
          attributes: ["plan", "status"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access and refresh token
    const newAccessToken = accessTokenGen(user);
    const newRefreshToken = refreshTokenGen(user);

    await UserModel.update({ refreshToken }, { where: { id: user.id } });

    const cookieAccess = {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      domain:
        ENV.NODE_ENV === "production" ? ".smarthisabkitab.com" : undefined,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    };

    const cookieRefresh = {
      ...cookieAccess,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .cookie("accessToken", newAccessToken, cookieAccess)
      .cookie("refreshToken", newRefreshToken, cookieRefresh)
      .status(200)
      .json({
        success: true,
        message: "Refreshed Successfully",
      });
  } catch (error) {
    console.error("Refresh token error: ", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
