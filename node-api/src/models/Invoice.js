const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Invoice = sequelize.define(
  "Invoice",
  {
    invoice_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    fee_id: { type: DataTypes.INTEGER, allowNull: false },
    semester_id: { type: DataTypes.INTEGER, allowNull: false },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false },
    due_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amount_paid: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("Unpaid", "Partial", "Paid", "Overdue"),
      allowNull: false,
      defaultValue: "Unpaid",
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "invoices",
    timestamps: false,
  }
);

module.exports = Invoice;
