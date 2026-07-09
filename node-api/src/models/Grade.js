const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Grade = sequelize.define(
  "Grade",
  {
    grade_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assessment_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    entered_by: { type: DataTypes.INTEGER, allowNull: false },
    entered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: "grades",
    timestamps: false,
  }
);

module.exports = Grade;
