const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const userRouter = require("./routes/userRouter");
const fileRouter = require("./routes/fileRouter");
const errorHandler = require("./controllers/errorController");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/file/", fileRouter);
app.use("/", userRouter);
app.use(errorHandler);
module.exports = app;
