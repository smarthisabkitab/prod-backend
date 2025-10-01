import { DataTypes, Sequelize } from "sequelize";
import { ENV } from "../../../config/env.js";

const shopConnections = {}; // cache

const createShopConnection = (dbName) => {
  if (shopConnections[dbName]) return shopConnections[dbName];

  const sequelize = new Sequelize(
    dbName,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: ENV.DB_HOST,
      dialect: "mysql",
      logging: ENV.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: parseInt(ENV.DB_POOL_MAX) || 5,
        min: parseInt(ENV.DB_POOL_MIN) || 0,
        acquire: parseInt(ENV.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(ENV.DB_POOL_IDLE) || 10000,
      },
    }
  );

  shopConnections[dbName] = sequelize;
  return sequelize;
};

const createShopModels = (sequelize) => {
  const Customer = sequelize.define(
    "Customer",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      fullname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone_no: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "customers",
      timestamps: true,
    }
  );

  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      date_of_issue: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_weight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
    },
    {
      tableName: "products",
      timestamps: true,
    }
  );

  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      pledged_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      given_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      interest_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 36,
      },
      time_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      received_interest: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "closed"),
        defaultValue: "active",
      },
      add_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      decrease_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      amount_changed_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      amount_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bank_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "transactions",
      timestamps: true,
    }
  );

  // Define associations INSIDE the function
  Customer.hasMany(Transaction, { foreignKey: "customer_id" });
  Transaction.belongsTo(Customer, { foreignKey: "customer_id" });

  Product.hasMany(Transaction, { foreignKey: "product_id" });
  Transaction.belongsTo(Product, { foreignKey: "product_id" });

  Transaction.prototype.calculateInterest = function (asOfDate = new Date()) {
    const calculationDate = new Date(asOfDate);
    const startDate = new Date(this.pledged_date);

    // Ensure we don't calculate interest for future dates
    if (calculationDate < startDate) {
      return 0;
    }

    const days = Math.floor(
      (calculationDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const dailyRate = this.interest_rate / 100 / 365;
    const interest = this.given_amount * dailyRate * days;

    return Math.max(0, interest - (this.received_interest || 0));
  };

  // Add method to check if transaction is overdue
  Transaction.prototype.isOverdue = function () {
    const dueDate = new Date(this.pledged_date);
    dueDate.setDate(dueDate.getDate() + this.time_duration);
    return new Date() > dueDate && this.status === "active";
  };

  // Define associations
  return {
    Customer,
    Product,
    Transaction,
    sequelize,
  };
};

export { createShopConnection, createShopModels };
