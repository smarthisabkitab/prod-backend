import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../../config/database.js";

class UserModel extends Model {}

UserModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("subscriber", "editor", "admin", "paid"),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "Users",
    freezeTableName: true,
  }
);

export default UserModel;
