const { Sequelize } = require("sequelize");
require("dotenv").config();

// Railway injects a single connection string (MYSQL_URL / DATABASE_URL) when you
// add a MySQL plugin. Use it if present; otherwise fall back to individual vars
// (works locally and on hosts that expose separate credentials).
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, {
      dialect: "mysql",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || "backend6_project",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
      }
    );

module.exports = sequelize;