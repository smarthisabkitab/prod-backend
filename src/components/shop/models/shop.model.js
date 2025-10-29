import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../../config/database.js";

class ShopModel extends Model {}

ShopModel.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    shop_name: { type: DataTypes.STRING(100), allowNull: false },
    db_name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_no: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "shops",
    modelName: "Shops",
    timestamps: true,
    freezeTableName: true,
  }
);

export default ShopModel;
