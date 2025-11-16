import bcrypt from "bcryptjs";

import UserModel from "../../users/models/user.model.js";
import { profileUpdatePasswordSchema } from "../helpers/update.profile.helper.js";

export const updatePassword = async () => {
  try {
    let user_id = req.user.id;
    let password = req.body.password;

    const user = await UserModel.findByPk(user_id);

    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const profileUpdatePassword = async (req, res) => {
  try {
    let user_id = req.user.id;
    let { error, value } = profileUpdatePasswordSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      console.error("Validation Error: ", error);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    let user = await UserModel.findByPk(user_id);

    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(
      value.oldPassword,
      user.password
    );

    if (validPassword === false) {
      return res.status(400).json({
        success: false,
        message: "Old Password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Profile Update Password Error: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
