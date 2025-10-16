import express from "express";

import { createShopTransaction } from "../controller/create.shop.transaction.js";
import {
  readShopTransaction,
  readShopCustomers,
  readShopProducts,
  readShopTransactions,
} from "../controller/read.shop.transaction.js";

import { deleteShopTransaction } from "../controller/delete.shop.transaction.js";

import {
  multerConfig,
  handleMulterError,
} from "../../../config/multer.config.js";

const shopTransactionRouter = express.Router();

shopTransactionRouter
  .post("/upload/:shop_id", multerConfig.single("file"), createShopTransaction)
  .get("/read/:shop_id", readShopTransaction)
  .get("/:shop_id/customers", readShopCustomers)
  .get("/:shop_id/products", readShopProducts)
  .get("/:shop_id/transactions", readShopTransactions)
  .delete("/delete", deleteShopTransaction);

shopTransactionRouter.use(handleMulterError);

export default shopTransactionRouter;
