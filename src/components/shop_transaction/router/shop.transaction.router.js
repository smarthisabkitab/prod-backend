import express from "express";

import { createShopTransaction } from "../controller/create.shop.transaction.js";
import {
  multerConfig,
  handleMulterError,
} from "../../../config/multer.config.js";

const shopTransactionRouter = express.Router();

shopTransactionRouter.post(
  "/upload",
  multerConfig.single("file"),
  createShopTransaction
);

shopTransactionRouter.use(handleMulterError);

export default shopTransactionRouter;
