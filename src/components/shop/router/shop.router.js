import express from "express";

import { createShop } from "../controllers/create.shop.js";
import { listAllShop, shopDetails } from "../controllers/fetch.shop.js";

const shop = express.Router();

shop.post("/create", createShop).get("/", listAllShop).get("/:id", shopDetails);

export default shop;
