const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Order = sequelize.define(
  "Order",
  {
    OrderID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    OrderNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    CustomerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    TotalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    Status: {
      type: DataTypes.ENUM(
        "Pending",
        "Processing",
        "Completed",
        "Cancelled"
      ),
      defaultValue: "Pending",
    },

    OrderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = Order;