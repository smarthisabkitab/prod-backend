import ShopModel from "../../shop/models/shop.model.js";
import {
  createShopConnection,
  createShopModels,
} from "../../shop/models/shop.factory.js";

export const readShopTransaction = async (req, res) => {
  try {
    let shopSequelize;
    let { shop_id } = req.params;
    if (!shop_id) {
      console.log("Shop Transaction -> Invalid Shop ID");

      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    let shop = await ShopModel.findByPk(shop_id);

    if (!shop) {
      console.log("Shop Transaction -> Shop not found");
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get shop-specific connection + models
    shopSequelize = createShopConnection(shop.db_name);
    const { Customer, Product } = createShopModels(shopSequelize);

    let customers = await Customer.findAll();
    let product = await Product.findAll();

    return res.status(200).json({
      success: true,
      customers,
      product,
    });
  } catch (error) {
    console.error(`Shop Transaction -> ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
