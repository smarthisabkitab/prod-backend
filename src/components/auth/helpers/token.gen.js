import jwt from "jsonwebtoken";

import { ENV } from "../../../config/env.js";

export const accessTokenGen = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: ENV.JWT_ACCESS_EXPIRY }
  );
export const refreshTokenGen = (user) =>
  jwt.sign(
    {
      id: user.id,
    },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: ENV.JWT_REFRESH_EXPIRY }
  );
