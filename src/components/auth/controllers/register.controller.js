import bcrypt from "bcryptjs";
import UserModel from "../../users/models/user.model.js";
import SubscriptionModel from "../../subscriptions/models/subscription.model.js";
import { registerHelper } from "../helpers/auth.helper.js";

export const registerController = async (req, res) => {
  try {
    let { error, value } = registerHelper.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Create user or fail if exists
    const [user, created] = await UserModel.findOrCreate({
      where: { email: value.email },
      defaults: {
        ...value,
        password: hashedPassword,
      },
    });

    if (!created) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create default subscription
    await SubscriptionModel.create({
      user_id: user.id,
      plan: "free",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
