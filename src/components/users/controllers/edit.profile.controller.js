import UserModel from "../models/user.model.js";
import { editProfileSchema } from "../../auth/helpers/update.profile.helper.js";

export const editProfileController = async (req, res) => {
  try {
    let { error, value } = editProfileSchema.validate(req.body);

    if (error) {
      console.error("Validation Error: ", error);
      return res.status(400).json({
        succes: false,
        message: error,
      });
    }

    let user = await UserModel.findByPk(req.user.id);

    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (value.email && user.email !== value.email) {
      await UserModel.findOne({
        where: {
          email: value.email,
        },
      });

      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let updateUser = await user.update(value);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updateUser,
    });
  } catch (error) {
    console.error(`Error editing profile: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
