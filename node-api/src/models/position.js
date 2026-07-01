const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbconnectSeqeulize");

const Position = sequelize.define(
  "Position",
  {
    PostID: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    PositionName: {
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
    tableName: "position",
    timestamps: false,
  }
);

module.exports = Position;