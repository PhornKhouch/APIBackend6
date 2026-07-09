const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const TimeSlot = sequelize.define(
  "TimeSlot",
  {
    time_slot_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    day_of_week: {
      type: DataTypes.ENUM("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"),
      allowNull: false,
    },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
  },
  {
    tableName: "time_slots",
    timestamps: false,
  }
);

module.exports = TimeSlot;
