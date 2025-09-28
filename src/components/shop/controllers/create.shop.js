import ShopModel from "../models/shop.model.js";
import {
  createShopConnection,
  createShopModels,
} from "../models/shop.factory.js";
import { createShopValidate } from "../helpers/shop.helper.js";
import { sequelize } from "../../../config/database.js";
import { generateRandomString } from "../../../modules/random.num.js";

export const createShop = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    let { error, value } = createShopValidate.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const randomString = generateRandomString(6);

    const db_name = `shop_${Date.now()}_${randomString}`;

    let shop = await ShopModel.create(
      {
        ...value,
        db_name,
      },
      { transaction }
    );

    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\`;`, {
      transaction,
    });

    // init shop DB + models
    const shopSequelize = createShopConnection(db_name);
    createShopModels(shopSequelize);
    await shopSequelize.sync();

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
