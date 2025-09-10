import express from "express";

import { createShop } from "../controllers/create.shop.js";
import { listAllShop, shopDetails } from "../controllers/fetch.shop.js";
import { deleteShop } from "../controllers/delete.shop.js";
import { updateShopController } from "../controllers/update.shop.js";

const shop = express.Router();

shop
  .post("/create", createShop)
  .get("/", listAllShop)
  .patch("/edit/:id", updateShopController)
  .put("/delete/:shop_id", deleteShop)
  .get("/:id", shopDetails);

export default shop;
