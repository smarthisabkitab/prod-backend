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
    const { Customer, Product } = createShopModels(shopSequelize);

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

    // Now insert into DB
    transaction = await shopSequelize.transaction();

    const customerMap = new Map();
    const insertedProducts = [];

    for (const row of results) {
      const phone = row.phone_no?.trim();
      if (!phone) continue;

      let customerId;
      if (customerMap.has(phone)) {
        customerId = customerMap.get(phone);
      } else {
        const [customer] = await Customer.findOrCreate({
          where: { phone_no: phone },
          defaults: {
            fullname: row.fullname.trim() || "Unknown",
            address: row.address.trim() || "",
          },
          transaction,
        });
        customerId = customer.id;
        customerMap.set(phone, customerId);
      }

      const product = await Product.create(
        {
          customer_id: customerId,
          date_of_issue: row.pledged_date.trim() || new Date(),
          product_name: row.particulars.trim() || "N/A",
          quantity: parseInt(row.quantity.trim()) || 0,
          total_weight: parseFloat(row.total_weight.trim()) || 0,
          given_amount: parseFloat(row.given_amount.trim()) || 0,
          intrest_rate: parseFloat(row.intrest_rate) || 36,
          time_duration: parseInt(row.time_duration) || 0,
          received_interest: parseFloat(row.received_interest) || 0,
          status: row.status || "active",
          add_amount: parseFloat(row.add_amount) || 0,
          decrease_amount: parseFloat(row.decrease_amount) || 0,
          amount_changed_date: row.amount_changed_date || null,
          amount_end_date: row.amount_end_date || new Date(),
          bank_number: row.bank_number || null,
          notes: row.notes || null,
        },
        { transaction }
      );

      insertedProducts.push(product);
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Data Uploaded Successfully",
      inserted_count: insertedProducts.length,
      items: insertedProducts,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Shop Transaction -> ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (req.file) cleanupUploadedFile(req.file.path);
  }
};
