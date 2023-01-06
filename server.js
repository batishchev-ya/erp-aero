require("dotenv").config();
const app = require("./app");

async function start() {
  const sequelize = require("./utils/database");
  const User = require("./models/userModel");
  const Token = require("./models/tokenModel");
  const File = require("./models/fileModel");
  await sequelize.sync();
  const port = process.env.PORT || 3000;

  const server = app.listen(port, () => {
    console.log(`App runing on port ${port}...`);
  });
}
start();
