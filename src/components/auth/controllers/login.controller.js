import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../../users/models/user.model.js";
import SubscriptionModel from "../../subscriptions/models/subscription.model.js";
import { loginHelper } from "../helpers/auth.helper.js";
import { ENV } from "../../../config/env.js";

export const loginController = async (req, res) => {
  try {
    let { value, error } = loginHelper.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const user = await UserModel.findOne({
      where: { email: value.email },
      include: [
        {
          model: SubscriptionModel,
          as: "subscription",
          attributes: ["plan", "status"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const validPassword = await bcrypt.compare(value.password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate Access Token (short-lived)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: "15m" } // 15 minutes
    );

    // Generate Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // 7 days
    );

    // Store refresh token in database (optional but recommended)
    await UserModel.update({ refreshToken }, { where: { id: user.id } });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        phone_no: user.phone_no,
      },
    });
  } catch (error) {
    console.error("Login error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
