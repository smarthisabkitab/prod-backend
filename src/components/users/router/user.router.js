import express from "express";

import { listAllUsers } from "../controllers/list.user.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import { requireAdmin } from "../../../middleware/role.middleware.js";

const user = express.Router();

user.get("/", authenticateToken, requireAdmin, listAllUsers);

export default user;
