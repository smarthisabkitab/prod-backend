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
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      total_purchase_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.0,
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      purity: {
        type: DataTypes.ENUM("22K", "18K", "14K", "10K"),
        defaultValue: "22K",
      },
      weight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      making_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      transaction_type: {
        type: DataTypes.ENUM("sale", "purchase", "return", "exchange"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      gold_weight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      making_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      gold_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName: "transactions",
      timestamps: true,
    }
  );

  const TransactionItem = sequelize.define(
    "TransactionItem",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "transaction_items",
      timestamps: false,
    }
  );

  // Define associations
  Customer.hasMany(Transaction, { foreignKey: "customer_id" });
  Transaction.belongsTo(Customer, { foreignKey: "customer_id" });

  Transaction.hasMany(TransactionItem, { foreignKey: "transaction_id" });
  TransactionItem.belongsTo(Transaction, { foreignKey: "transaction_id" });

  Product.hasMany(TransactionItem, { foreignKey: "product_id" });
  TransactionItem.belongsTo(Product, { foreignKey: "product_id" });

  return {
    Customer,
    Product,
    Transaction,
    TransactionItem,
    sequelize,
  };
};

export { createShopConnection, createShopModels };
