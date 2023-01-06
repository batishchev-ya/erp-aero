const { DataTypes, Model } = require("sequelize");
const sequelize = require("../utils/database");
const User = require("./userModel");
class Token extends Model {}

Token.init(
  {
    user_id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    refresh_token: { type: DataTypes.STRING },
  },
  { sequelize }
);

//

module.exports = Token;
