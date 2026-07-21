const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

// Join table linking a schedule entry (a subject in a time slot for a class)
// to the individual students assigned to that session. Created automatically by
// sequelize.sync() on boot.
const ScheduleStudent = sequelize.define(
  "ScheduleStudent",
  {
    schedule_student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    assigned_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "schedule_students",
    timestamps: false,
  }
);

module.exports = ScheduleStudent;
