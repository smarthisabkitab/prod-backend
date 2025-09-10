import express from "express";

import { listAllSubscription } from "../controllers/fetch.subscription.js";

const subscription = express.Router();

subscription.get("/", listAllSubscription);

export default subscription;
