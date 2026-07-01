const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Department = sequelize.define(
  "Department",
  {
    DeptID: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    DepartmentName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "department",
    timestamps: false,
  }
);

module.exports = Department;