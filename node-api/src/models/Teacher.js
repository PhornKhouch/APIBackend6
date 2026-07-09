const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Teacher = sequelize.define(
  "Teacher",
  {
    teacher_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    first_name: { type: DataTypes.STRING(50), allowNull: false },
    last_name: { type: DataTypes.STRING(50), allowNull: false },
    gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: true },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    photo_url: { type: DataTypes.STRING(255), allowNull: true },
    contact_number: { type: DataTypes.STRING(20), allowNull: true },
    specialization: { type: DataTypes.STRING(100), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    hire_date: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.ENUM("Active", "Inactive"), allowNull: false, defaultValue: "Active" },
  },
  {
    tableName: "teachers",
    timestamps: false,
  }
);

module.exports = Teacher;
