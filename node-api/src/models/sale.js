const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Sale = sequelize.define(
  "Sales",
  {
    SaleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    SaleCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    CustomerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    SaleDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    TotalAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    Status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  }
);

module.exports = Sale;