const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "backend6_project",
  "root",
  "",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;