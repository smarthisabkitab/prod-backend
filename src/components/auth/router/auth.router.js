import express from "express";

import { registerController } from "../controllers/register.controller.js";
import { loginController } from "../controllers/login.controller.js";
import { logoutController } from "../controllers/logout.controller.js";
import { refreshTokenController } from "../controllers/token.controller.js";

const auth = express.Router();

auth
  .post("/register", registerController)
  .post("/login", loginController)
  .post("/logout", logoutController)
  .post("/refresh-token", refreshTokenController);

export default auth;
