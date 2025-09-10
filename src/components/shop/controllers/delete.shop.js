import ShopModel from "../models/shop.model.js";

export const deleteShop = async (req, res) => {
  try {
    let { shop_id } = req.params;

    let shop = await ShopModel.findOne({
      where: {
        id: shop_id,
      },
    });

    if (!shop) {
      console.error("Unable to find shop");
      return res.status(404).json({
        sucess: false,
        message: "Shop Not Found",
      });
    }

    shop.status = "inactive";
    await shop.save();

    console.info(`${shop.id} is deleted`);
    return res.status(200).json({
      success: true,
      message: `${shop.shop_name} is deleted successfully`,
    });
  } catch (error) {
    console.error(`Error deleting shop: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
