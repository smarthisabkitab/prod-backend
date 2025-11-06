import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, ENV.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
        });
      }
      return res.status(403).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = decoded;
    next();
  });
};
