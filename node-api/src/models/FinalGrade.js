const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const FinalGrade = sequelize.define(
  "FinalGrade",
  {
    final_grade_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    semester_id: { type: DataTypes.INTEGER, allowNull: false },
    final_score: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    letter_grade: { type: DataTypes.STRING(2), allowNull: true },
    gpa_points: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
    computed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "final_grades",
    timestamps: false,
  }
);

module.exports = FinalGrade;
