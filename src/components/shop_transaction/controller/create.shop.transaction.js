import csvParser from "csv-parser";
import fs from "fs";

import ShopModel from "../../shop/models/shop.model.js";
import { cleanupUploadedFile } from "../../../config/multer.config.js";
import {
  createShopConnection,
  createShopModels,
} from "../../shop/models/shop.factory.js";

export const createShopTransaction = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  let transaction;
  try {
    const { shop_id } = req.params;
    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await ShopModel.findByPk(shop_id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get shop-specific connection + models
    const shopSequelize = createShopConnection(shop.db_name);
    const { Customer, Product, Transaction } = createShopModels(shopSequelize);

    // Test connection and sync if needed
    await shopSequelize.authenticate();

    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (data) => {
          const normalized = {};
          for (let key in data) {
            normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] =
              data[key];
          }
          results.push(normalized);
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "CSV file is empty or invalid",
      });
    }

    // Now insert into DB
    transaction = await shopSequelize.transaction();

    const customerMap = new Map();
    const insertedTransactions = [];

    for (const [index, row] of results.entries()) {
      try {
        const phone = row.phone_no?.trim();
        if (!phone) {
          console.warn(`Skipping row ${index + 1}: No phone number provided`);
          continue;
        }

        // Find or create customer
        let customerId;
        if (customerMap.has(phone)) {
          customerId = customerMap.get(phone);
        } else {
          const [customer] = await Customer.findOrCreate({
            where: { phone_no: phone },
            defaults: {
              fullname: row.fullname?.trim() || "Unknown",
              address: row.address?.trim() || "",
            },
            transaction,
          });
          customerId = customer.id;
          customerMap.set(phone, customerId);
        }

        // Create product first
        const product = await Product.create(
          {
            date_of_issue: row.date_of_issue ? new Date(row.date_of_issue.trim()) : new Date(),
            product_name: row.product_name?.trim() || row.particulars?.trim() || "N/A",
            quantity: parseInt(row.quantity?.trim()) || 1,
            total_weight: parseFloat(row.total_weight?.trim()) || 0,
          },
          { transaction }
        );

        // Create transaction with proper field mapping
        const transactionData = {
          customer_id: customerId,
          product_id: product.id,
          shop_id: parseInt(shop_id),
          pledged_date: row.pledged_date ? new Date(row.pledged_date.trim()) : new Date(),
          given_amount: parseFloat(row.given_amount?.trim()) || 0,
          interest_rate: parseFloat(row.interest_rate?.trim()) || parseFloat(row.intrest_rate?.trim()) || 36, // Handle typo in CSV
          time_duration: parseInt(row.time_duration?.trim()) || 30, // Default 30 days
          received_interest: parseFloat(row.received_interest?.trim()) || 0,
          status: (row.status?.trim() && ['active', 'inactive', 'closed'].includes(row.status.trim().toLowerCase())) 
            ? row.status.trim().toLowerCase() 
            : 'active',
          add_amount: parseFloat(row.add_amount?.trim()) || 0,
          decrease_amount: parseFloat(row.decrease_amount?.trim()) || 0,
          amount_changed_date: row.amount_changed_date ? new Date(row.amount_changed_date.trim()) : null,
          amount_end_date: row.amount_end_date ? new Date(row.amount_end_date.trim()) : null,
          bank_number: row.bank_number?.trim() || null,
          notes: row.notes?.trim() || null,
        };

        const shopTransaction = await Transaction.create(transactionData, {
          transaction,
        });

        insertedTransactions.push(shopTransaction);
      } catch (rowError) {
        console.error(`Error processing row ${index + 1}:`, rowError);
        throw new Error(`Failed to process row ${index + 1}: ${rowError.message}`);
      }
    }

    if (insertedTransactions.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "No valid data found to import",
      });
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Data Uploaded Successfully",
      inserted_count: insertedTransactions.length,
      customers_processed: customerMap.size,
      items: insertedTransactions,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Shop Transaction Import Error -> ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to import data",
      error: error.message,
    });
  } finally {
    if (req.file) cleanupUploadedFile(req.file.path);
  }
};