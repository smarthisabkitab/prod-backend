import express from "express";

import shop from "./components/shop/router/shop.router.js";
import auth from "./components/auth/router/auth.router.js";
import user from "./components/users/router/user.router.js";

const apiRoute = express.Router();

apiRoute.use("/shops", shop).use("/auth", auth).use("/users", user);

export default apiRoute;
