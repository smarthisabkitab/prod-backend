import express from "express";

import { registerController } from "../controllers/register.controller.js";
import { loginController } from "../controllers/login.controller.js";

const auth = express.Router();

auth.post("/register", registerController).post("/login", loginController);

export default auth;
