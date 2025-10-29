import ShopModel from "../../shop/models/shop.model.js";
import {
  createShopConnection,
  createShopModels,
} from "../../shop/models/shop.factory.js";

export const editShopTransaction = async (req, res) => {
  let transaction;

  try {
    const { shop_id, transaction_id } = req.params;
    const updates = req.body;
    if (!shop_id || !transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Shop ID and Transaction ID are required",
      });
    }

    // Get shop info
    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Create shop-specific DB connection + models
    const shopSequelize = createShopConnection(shop.db_name);
    const { Transaction } = createShopModels(shopSequelize);
    await shopSequelize.authenticate();

    // Fetch transaction
    const tx = await Transaction.findByPk(transaction_id);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Start a DB transaction
    transaction = await shopSequelize.transaction();

    // Allowed fields for safety
    const editableFields = [
      "pledged_date",
      "given_amount",
      "interest_rate",
      "time_duration",
      "received_interest",
      "status",
      "add_amount",
      "decrease_amount",
      "amount_changed_date",
      "amount_end_date",
      "bank_number",
      "notes",
    ];

    let hasChanges = false;

    // Update only provided fields
    for (const key of editableFields) {
      if (updates[key] !== undefined) {
        tx[key] = updates[key];
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Recalculate interest, due date, and pending amount
    tx.calculated_interest = tx.calculateInterest(
      tx.amount_end_date || new Date()
    );

    const pledgedDate = new Date(tx.pledged_date);
    tx.due_date = new Date(pledgedDate);
    tx.due_date.setDate(pledgedDate.getDate() + tx.time_duration);

    tx.pending_amount = (
      tx.given_amount +
      tx.add_amount -
      tx.decrease_amount +
      tx.calculated_interest -
      tx.received_interest
    ).toFixed(2);

    // Auto-close if pending is 0
    if (tx.pending_amount <= 0) {
      tx.status = "closed";
    }

    await tx.save({ transaction });
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      updated_transaction: tx,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Transaction Update Error →", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};
