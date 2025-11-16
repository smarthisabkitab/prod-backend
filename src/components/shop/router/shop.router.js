import express from "express";

import { createShop } from "../controllers/create.shop.js";
import { listAllShop, shopDetails } from "../controllers/fetch.shop.js";
import { deleteShop } from "../controllers/delete.shop.js";
import { updateShopController } from "../controllers/update.shop.js";

import { authenticateToken } from "../../../middleware/auth.middleware.js";

const shop = express.Router();

shop
  .post("/create", authenticateToken, createShop)
  .get("/", authenticateToken, listAllShop)
  .patch("/edit/:id", authenticateToken, updateShopController)
  .put("/delete/:shop_id", authenticateToken, deleteShop)
  .get("/:id", authenticateToken, shopDetails);

export default shop;
