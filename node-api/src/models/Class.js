const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Class = sequelize.define(
  "Class",
  {
    class_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    class_name: { type: DataTypes.STRING(50), allowNull: false },
    academic_year_id: { type: DataTypes.INTEGER, allowNull: false },
    semester_id: { type: DataTypes.INTEGER, allowNull: false },
    room_number: { type: DataTypes.STRING(20), allowNull: true },
    max_capacity: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "classes",
    timestamps: false,
  }
);

module.exports = Class;
