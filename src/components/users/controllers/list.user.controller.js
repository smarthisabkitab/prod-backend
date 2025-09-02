import UserModel from "../models/user.model.js";
import SubscriptionModel from "../../subscriptions/models/subscription.model.js";

const listAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let offset = (page - 1) * limit;

    const { rows: users, count } = await UserModel.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: SubscriptionModel,
          as: "subscription",
          attributes: ["id", "plan", "start_date", "end_date", "status"],
        },
      ],
      attributes: [
        "id",
        "fullname",
        "email",
        "role",
        "phone_no",
        "address",
        "last_login",
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      items: users,
      pagination: {
        page,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error listing users with subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const userProfile = async (req, res) => {};

export { listAllUsers, userProfile };
