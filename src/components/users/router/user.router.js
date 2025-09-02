import express from "express";

import { listAllUsers } from "../controllers/list.user.controller.js";

const user = express.Router();

user.get("/", listAllUsers);

export default user;
