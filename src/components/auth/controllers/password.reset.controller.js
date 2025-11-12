import bcrypt from "bcryptjs";

import UserModel from "../../users/models/user.model.js";

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
  } catch (error) {}
};
