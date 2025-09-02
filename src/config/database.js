import { Sequelize } from "sequelize";
import { ENV } from "./env.js";

// Connection pool configuration for better performance
const poolConfig = {
  max: ENV.DB_POOL_MAX || 5,
  min: parseInt(ENV.DB_POOL_MIN) || 0,
  acquire: ENV.DB_POOL_ACQUIRE || 30000,
  idle: ENV.DB_POOL_IDLE || 10000,
};

// Add SSL configuration if needed
const dialectOptions = {};
if (ENV.DB_SSL === 'true') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

const dbConfig = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT || 3306, // Explicit port configuration
  dialect: "mysql",
  logging: ENV.NODE_ENV === "development" ? console.log : false,
  pool: poolConfig,
  retry: {
    max: 3, // Maximum number of retries
  },
  define: {
    timestamps: true, // Enable createdAt and updatedAt by default
    underscored: false, // Use snake_case instead of camelCase for column names
    freezeTableName: true, // Prevent pluralization of table names
    charset: 'utf8mb4', // Support emojis and special characters
    collate: 'utf8mb4_unicode_ci',
  },
  dialectOptions,
  timezone: "+05:45",
  benchmark: ENV.NODE_ENV === "development",
};

export const sequelize = new Sequelize(
  ENV.DB_NAME,
  ENV.DB_USER,
  ENV.DB_PASSWORD,
  dbConfig
);

// Connection test function with retry logic for containerized environments
export const authenticate = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Database connection has been established successfully.");
      return { success: true, message: "Database connection established" };
    } catch (error) {
      console.error(`Unable to connect to the database (attempt ${i + 1}/${retries}):`, error.message);
      
      if (i === retries - 1) {
        return {
          success: false,
          message: "Database connection failed",
          error: error.message,
        };
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Add connection validation
sequelize.validate()
  .then(() => console.log('Connection validated successfully'))
  .catch(err => console.error('Connection validation failed:', err));

// Connection event handlers
sequelize
  .afterConnect(() => {
    console.log("Database connection established");
  })
  .afterDisconnect(() => {
    console.log("Database connection closed");
  });

// Graceful shutdown for different signals
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received: Closing database connection...`);
  try {
    await sequelize.close();
    console.log("Database connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error closing database connection:", error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Optional: Keep-alive query to prevent timeouts in some environments
if (ENV.DB_KEEP_ALIVE === 'true') {
  setInterval(async () => {
    try {
      await sequelize.query('SELECT 1');
    } catch (error) {
      console.error('Keep-alive query failed:', error);
    }
  }, 60000); // Run every minute
}

export default sequelize;