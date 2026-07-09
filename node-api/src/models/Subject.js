const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Subject = sequelize.define(
  "Subject",
  {
    subject_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subject_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    subject_name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    prerequisite_subject_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "subjects",
    timestamps: false,
  }
);

module.exports = Subject;
