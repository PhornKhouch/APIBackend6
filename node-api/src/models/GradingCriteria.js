const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const GradingCriteria = sequelize.define(
  "GradingCriteria",
  {
    criteria_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: true },
    component_name: { type: DataTypes.STRING(50), allowNull: false },
    weight_percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  },
  {
    tableName: "grading_criteria",
    timestamps: false,
  }
);

module.exports = GradingCriteria;
