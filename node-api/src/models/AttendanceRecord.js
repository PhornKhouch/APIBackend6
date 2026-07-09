const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const AttendanceRecord = sequelize.define(
  "AttendanceRecord",
  {
    attendance_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    attendance_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Late", "Excused"),
      allowNull: false,
    },
    marked_by: { type: DataTypes.INTEGER, allowNull: false },
    marked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    last_edited_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "attendance_records",
    timestamps: false,
  }
);

module.exports = AttendanceRecord;
