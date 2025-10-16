import ShopModel from "../../shop/models/shop.model.js";
import {
  createShopConnection,
  createShopModels,
} from "../../shop/models/shop.factory.js";

export const deleteShopTransaction = async (req, res) => {
  const shop_id = parseInt(req.query.shop_id);
  const transaction_id = parseInt(req.query.transaction_id);

  if (!shop_id || !transaction_id) {
    return res.status(400).json({
      success: false,
      message: "Missing shop_id or transaction_id",
    });
  }

  let transaction;
  try {
    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const shopSequelize = createShopConnection(shop.db_name);
    const { Transaction } = createShopModels(shopSequelize);

    await shopSequelize.authenticate();

    transaction = await shopSequelize.transaction();

    const record = await Transaction.findByPk(transaction_id, { transaction });
    if (!record) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Perform deletion
    await record.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Shop Transaction Delete Error -> ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};
