import crypto from "crypto";

export const generateRandomString = (length) => {
  const numBytes = Math.ceil(length / 2);
  const randomBytes = crypto.randomBytes(numBytes);
  return randomBytes.toString("hex").slice(0, length);
};
