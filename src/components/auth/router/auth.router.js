import express from "express";

import { registerController } from "../controllers/register.controller.js";
import { loginController } from "../controllers/login.controller.js";
import { logoutController } from "../controllers/logout.controller.js";
import { refreshTokenController } from "../controllers/token.controller.js";
import { updatePassword } from "../controllers/password.reset.controller.js";

import { authenticateToken } from "../../../middleware/auth.middleware.js";

const auth = express.Router();

auth
  .post("/register", registerController)
  .post("/login", loginController)
  .post("/logout", logoutController)
  .post("/refresh-token", refreshTokenController)
  .patch("/update-password", authenticateToken, updatePassword);

export default auth;
