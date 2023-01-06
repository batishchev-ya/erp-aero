const { DataTypes, Model } = require("sequelize");
const sequelize = require("../utils/database");

class File extends Model {}

File.init(
  {
    fileName: { type: DataTypes.STRING, allowNull: false },
    extensionName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    defaultScope: {
      attributes: {
        exclude: ["updatedAt"],
      },
    },
    sequelize,
  }
);

module.exports = File;
