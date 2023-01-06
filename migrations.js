const mysql2 = require("mysql2/promise");
require("dotenv").config();
init();
async function init() {
  try {
    const connection = await mysql2.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`
    );
    await connection.end();
    console.log("Database created successfully");
  } catch (err) {
    console.log("Database creation failed");
    console.log(err);
  }
}
