import UserModel from "../../users/models/user.model.js";

export const deleteProfileController = async (req, res) => {
  try {
    let user_id = req.user.id;

    let user = await UserModel.findByPk(user_id);

    if (!user) {
      console.error("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await UserModel.update(
      {
        is_deleted: 1,
      },
      {
        where: {
          id: user_id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete Profile Error: ", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
