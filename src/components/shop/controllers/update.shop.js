import ShopModel from "../models/shop.model.js";
import { updateShopValidate } from "../helpers/shop.helper.js";

export const updateShopController = async (req, res) => {
  try {
    let { error, value } = updateShopValidate.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      console.error("Validation Error");
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;

    let shop = await ShopModel.findOne({
      where: {
        id,
      },
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    await shop.update(value)


    return res.json({
      success: true,
      message: "Shop updated successfully",
    });
  } catch (error) {
    console.error(`Error updating shop: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
