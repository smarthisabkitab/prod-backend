import ShopModel from "../models/shop.model.js";

const listAllShop = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    let offset = (page - 1) * limit;

    let { rows: items, count } = await ShopModel.findAndCountAll({
      limit,
      offset,
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
    console.error("Error while listing all shop: ", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error
    })
  }
};

const shopDetails = async (req, res) => {
  try {
    let { shop_id } = req.query;

    if (!shop_id) {
      return res.status(404).json({
        success: false,
        message: "Shop Id is missing",
      });
    }
  } catch (error) {}
};

export { listAllShop, shopDetails };
