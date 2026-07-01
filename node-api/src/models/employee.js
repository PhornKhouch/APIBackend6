const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");
const Department = require("./department");
const Position = require("./position");
const Employee = sequelize.define(
  "Employee",
  {
    EmpCode: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },

    EmpName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    Gender: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },

    PositionID: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },

    DepartmentID: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },

    OfficeID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    DivisionID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    BranchID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
     remark: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "employee",
    timestamps: false,
    freezeTableName: true,
    
  }
  
);
Employee.belongsTo(Department, { foreignKey: "DepartmentID" });
Employee.belongsTo(Position, { foreignKey: "PositionID" });
module.exports = Employee;