const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const AcademicYear = sequelize.define(
  "AcademicYear",
  {
    academic_year_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    year_name: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("Active", "Closed"), allowNull: false, defaultValue: "Active" },
  },
  {
    tableName: "academic_years",
    timestamps: false,
  }
);

module.exports = AcademicYear;
