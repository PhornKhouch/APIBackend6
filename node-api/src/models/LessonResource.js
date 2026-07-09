const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const LessonResource = sequelize.define(
  "LessonResource",
  {
    resource_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_id: { type: DataTypes.INTEGER, allowNull: true },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    resource_type: {
      type: DataTypes.ENUM("LessonPlan", "Homework", "Syllabus", "Other"),
      allowNull: false,
    },
    file_url: { type: DataTypes.STRING(255), allowNull: true },
    upload_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "lesson_resources",
    timestamps: false,
  }
);

module.exports = LessonResource;
