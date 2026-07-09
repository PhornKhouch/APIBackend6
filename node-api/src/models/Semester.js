const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Semester = sequelize.define(
  "Semester",
  {
    semester_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    academic_year_id: { type: DataTypes.INTEGER, allowNull: false },
    semester_name: { type: DataTypes.STRING(30), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: "semesters",
    timestamps: false,
  }
);

module.exports = Semester;
