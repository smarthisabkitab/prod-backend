import express from "express";

import shop from "./components/shop/router/shop.router.js";
import auth from "./components/auth/router/auth.router.js";
import user from "./components/users/router/user.router.js";
import subscription from "./components/subscriptions/router/subscription.route.js";
import shopTransactionRouter from "./components/shop_transaction/router/shop.transaction.router.js";

const apiRoute = express.Router();

apiRoute
  .use("/shops", shop)
  .use("/auth", auth)
  .use("/users", user)
  .use("/subscription", subscription)
  .use("/shop-transaction", shopTransactionRouter);

export default apiRoute;
