const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "backend6",
  "root",
  "",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;