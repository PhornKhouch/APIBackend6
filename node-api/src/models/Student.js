const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Student = sequelize.define(
  "Student",
  {
    student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(50), allowNull: false },
    last_name: { type: DataTypes.STRING(50), allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: true },
    photo_url: { type: DataTypes.STRING(255), allowNull: true },
    contact_number: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: true },
    enrollment_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("Active", "Inactive"), allowNull: false, defaultValue: "Active" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "students",
    timestamps: false,
  }
);

module.exports = Student;
