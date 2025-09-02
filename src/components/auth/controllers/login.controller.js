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
          as: "subscription", // use alias if defined
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

    // create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
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
