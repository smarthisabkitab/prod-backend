import ShopModel from "../models/shop.model.js";
import { sequelize } from "../../../config/database.js";

const listAllShop = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let status = req.query.status || "active";
    let user_id = req.query.user_id || null;
    let sort = req.query.sort || "createdAt";
    let order = req.query.order ? req.query.order.toUpperCase() : "DESC";

    const transaction = await sequelize.transaction();

    if (user_id === null || req.user.id) {
      let existingUser = await sequelize.query(
        `select * from users where id=?`,
        {
          replacements: [user_id !== null ? user_id : req.user.id],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      console.log("Output: ----", existingUser);

      if (existingUser.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
    }

    let offset = (page - 1) * limit;

    let whereCondition = {};

    if (user_id) whereCondition.user_id = user_id;
    if (status) whereCondition.status = status;

    let { rows: items, count } = await ShopModel.findAndCountAll({
      limit,
      offset,
      where: {
        ...whereCondition,
      },
      order: [[sort, order]],
    });

    items = items.map((shop) => {
      let shopData = shop.toJSON();
      try {
        shopData.settings = shopData.settings
          ? JSON.parse(shopData.settings)
          : {};
      } catch (err) {
        shopData.settings = {}; // fallback if parsing fails
      }
      return shopData;
    });

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error while listing all shop: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

const shopDetails = async (req, res) => {
  try {
    let { id } = req.params;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Shop Id is missing",
      });
    }

    let item = await ShopModel.findByPk(id);

    let shopData = item.toJSON();

    // Safely parse settings
    try {
      shopData.settings = shopData.settings
        ? JSON.parse(shopData.settings)
        : {};
    } catch (err) {
      shopData.settings = {};
    }

    return res.status(200).json({
      success: true,
      item: shopData,
    });
  } catch (error) {
    console.error("Error while displaying shop details: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export { listAllShop, shopDetails };
