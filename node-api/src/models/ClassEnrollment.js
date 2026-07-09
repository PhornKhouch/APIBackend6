const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const ClassEnrollment = sequelize.define(
  "ClassEnrollment",
  {
    enrollment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    enrollment_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("Active", "Transferred", "Withdrawn"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    tableName: "class_enrollments",
    timestamps: false,
  }
);

module.exports = ClassEnrollment;
