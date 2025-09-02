import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/database.js";
import UserModel from "../../users/models/user.model.js";

class SubscriptionModel extends Model {}

SubscriptionModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    plan: {
      type: DataTypes.ENUM("free", "premium"),
      defaultValue: "free",
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    modelName: "Subscription",
    freezeTableName: true,
    timestamps: false,
  }
);

// Relations
UserModel.hasOne(SubscriptionModel, { foreignKey: "user_id", as: "subscription" });
SubscriptionModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });


export default SubscriptionModel;
