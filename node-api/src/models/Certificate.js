const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Certificate = sequelize.define(
  "Certificate",
  {
    certificate_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    certificate_type: {
      type: DataTypes.ENUM("Completion", "Transcript", "Recommendation"),
      allowNull: false,
    },
    template_used: { type: DataTypes.STRING(100), allowNull: true },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false },
    generated_file_url: { type: DataTypes.STRING(255), allowNull: true },
    issued_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "certificates",
    timestamps: false,
  }
);

module.exports = Certificate;
