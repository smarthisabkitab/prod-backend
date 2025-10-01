import express from "express";

import { createShopTransaction } from "../controller/create.shop.transaction.js";
import { readShopTransaction } from "../controller/read.shop.transaction.js";

import {
  multerConfig,
  handleMulterError,
} from "../../../config/multer.config.js";

const shopTransactionRouter = express.Router();

shopTransactionRouter
  .post("/upload/:shop_id", multerConfig.single("file"), createShopTransaction)
  .get("/read/:shop_id", readShopTransaction);

shopTransactionRouter.use(handleMulterError);

export default shopTransactionRouter;
