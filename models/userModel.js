const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = require("../utils/database");
const Token = require("./tokenModel");
class User extends Model {
  async correctPassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize }
);

// const User = sequelize.define("user", {
//   id: { type: DataTypes.STRING, primaryKey: true },
//   password: { type: DataTypes.STRING, allowNull: false },
// });

User.beforeCreate(async (user) => {
  if (user.password) {
    // console.log(user.password);
    user.password = await bcrypt.hash(user.password, 12);
    // console.log(user.password);
  }
});

User.hasMany(Token, { foreignKey: "user_id" });
// Token.belongsTo(User);

module.exports = User;
