import ShopModel from "../models/shop.model.js";

const listAllShop = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let status = req.query.status || "active";
    let user_id = req.query.user_id || null;
    let sort = req.query.sort || "createdAt";
    let order = req.query.order ? req.query.order.toUpperCase() : "DESC";

    if (!user_id || user_id === null) {
      console.error("Shop -> User Id is missing");
      return res.status(400).json({
        success: false,
        message: "User Id is missing",
      });
    }

    let offset = (page - 1) * limit;

    let whereCondition = {
      user_id,
    };

    if (status) whereCondition.status = status;

    let { rows: items, count } = await ShopModel.findAndCountAll({
      limit,
      offset,
      where: {
        ...whereCondition,
      },
      order: [[sort, order]],
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

    return res.status(200).json({
      success: true,
      item,
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
