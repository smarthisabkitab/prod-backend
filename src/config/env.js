import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load appropriate .env file
const envPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../../.env.production")
    : path.resolve(__dirname, "../../.env.development");

dotenv.config({ path: envPath });

// Export environment variables
export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_POOL_MAX: process.env.POOL_MAX,
  DB_POOL_MIN: process.env.DB_POOL_MIN,
  DB_POOL_ACQUIRE: process.env.DB_POOL_ACQUIRE,
  DB_POOL_IDLE: process.env.DB_POOL_IDLE,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
};
