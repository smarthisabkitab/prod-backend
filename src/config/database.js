import { Sequelize } from "sequelize";
import { ENV } from "./env.js";

const poolConfig = {
  max: parseInt(ENV.DB_POOL_MAX) || 5,
  min: parseInt(ENV.DB_POOL_MIN) || 0,
  acquire: parseInt(ENV.DB_POOL_ACQUIRE) || 30000,
  idle: parseInt(ENV.DB_POOL_IDLE) || 10000,
};

const dbConfig = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT || 3306,
  dialect: "mysql",
  pool: poolConfig,
  retry: { max: 3 },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
  timezone: "+05:45",
};

const sequelize = new Sequelize(
  ENV.DB_NAME,
  ENV.DB_USER,
  ENV.DB_PASSWORD,
  dbConfig
);

export const authenticate = async (retries = 3, delay = 2000) => {
  console.log(`${ENV.DB_PASSWORD} ---- ${ENV.DB_USER} ---- ${ENV.DB_HOST}`);
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Database connection has been established successfully.");
      return { success: true };
    } catch (error) {
      console.error(
        `Unable to connect to the database (attempt ${i + 1}/${retries}):`,
        error.message
      );
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed successfully");
  } catch (error) {
    console.error("Error closing database connection:", error.message);
  }
};

export { sequelize };
