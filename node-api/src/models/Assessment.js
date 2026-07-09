const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Assessment = sequelize.define(
  "Assessment",
  {
    assessment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    criteria_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    assessment_name: { type: DataTypes.STRING(100), allowNull: false },
    max_score: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    assessment_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "assessments",
    timestamps: false,
  }
);

module.exports = Assessment;
