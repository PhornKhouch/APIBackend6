const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const FeeStructure = sequelize.define(
  "FeeStructure",
  {
    fee_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    class_id: { type: DataTypes.INTEGER, allowNull: true },
    semester_id: { type: DataTypes.INTEGER, allowNull: false },
    fee_name: { type: DataTypes.STRING(100), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "fee_structures",
    timestamps: false,
  }
);

module.exports = FeeStructure;
