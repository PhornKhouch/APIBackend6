const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const StudentEmergencyContact = sequelize.define(
  "StudentEmergencyContact",
  {
    contact_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    contact_name: { type: DataTypes.STRING(100), allowNull: false },
    relationship: { type: DataTypes.STRING(50), allowNull: true },
    phone_number: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    tableName: "student_emergency_contacts",
    timestamps: false,
  }
);

module.exports = StudentEmergencyContact;
