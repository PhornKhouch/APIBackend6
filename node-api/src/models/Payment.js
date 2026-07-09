const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_id: { type: DataTypes.INTEGER, allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_method: {
      type: DataTypes.ENUM("Cash", "ABA", "BankTransfer", "Check"),
      allowNull: false,
    },
    receipt_url: { type: DataTypes.STRING(255), allowNull: true },
    recorded_by: { type: DataTypes.INTEGER, allowNull: false },
    notes: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "payments",
    timestamps: false,
  }
);

module.exports = Payment;
