const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Schedule = sequelize.define(
  "Schedule",
  {
    schedule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    time_slot_id: { type: DataTypes.INTEGER, allowNull: false },
    room_number: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    tableName: "schedules",
    timestamps: false,
  }
);

module.exports = Schedule;
