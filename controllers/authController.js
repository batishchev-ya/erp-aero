const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const catchAsync = require("../utils/catchAsync");

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const saveRefreshToken = async (id, refreshToken) => {
  const oldRefreshToken = await Token.findOne({ where: { user_id: id } });
  if (oldRefreshToken) {
    oldRefreshToken.refresh_token = refreshToken;
    await oldRefreshToken.save();
    return;
  }
  await Token.create({ user_id: id, refresh_token: refreshToken });
};

const createSendToken = async (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);
  // res.cookie("accessToken", accessToken, {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_ACCESS_EXPIRES_IN * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   // secure: req.secure || req.headers["x-forwaded-proto"] === "https",
  // });
  res.cookie("refreshToken", refreshToken, {
    expires: new Date(
      Date.now() + process.env.JWT_REFRESH_EXPIRES_IN_COOKIE * 60 * 1000
    ),
    httpOnly: true,
    // secure: req.secure || req.headers["x-forwaded-proto"] === "https",
  });
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
    userId: user.id,
  });
};

const validateAccessToken = async (accessToken) => {
  try {
    const user = await promisify(jwt.verify)(
      accessToken,
      process.env.JWT_ACCESS_SECRET
    );
    return user.id;
  } catch (err) {
    return null;
  }
};

const validateRefreshToken = async (refreshToken) => {
  try {
    const user = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    return user.id;
  } catch (err) {
    return null;
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return next(new Error("Please provide id and password"));
  }

  const newUser = await User.create({
    id,
    password,
  });

  createSendToken(newUser, 200, res, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return next(new Error("Please provide id and password"));
  }
  const user = await User.findOne({ where: { id } });

  if (!user) {
    return next(new Error("No user found with this id"));
  }
  if (!(await user.correctPassword(password))) {
    return next(new Error("Incorrect password"));
  }

  createSendToken(user, 200, res, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  if (refreshToken) {
    await Token.destroy({
      where: { refresh_token: refreshToken },
    });
  }
  return res.status(200).json({ message: "You are logged out" });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  }

  if (!refreshToken || !accessToken) {
    return next(new Error("You are not authorized. Please log in "));
  }

  const userId = await validateRefreshToken(refreshToken);
  if (!userId) {
    return next(new Error("You are not authorized. Please log in "));
  }

  const userFromDB = await User.findOne({ where: { id: userId } });

  if (!userFromDB) {
    return next(new Error("User was deleted"));
  }

  const newAccessToken = signAccessToken(userId);
  return res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
    userId: userId,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  }
  if (!accessToken) {
    return next(new Error("You are not authorized. Please log in "));
  }
  const userId = await validateAccessToken(accessToken);
  if (!userId) {
    return next(new Error("You are not authorized. Please log in "));
  }
  const userFromDB = await User.findOne({ where: { id: userId } });
  if (!userFromDB) {
    return next(new Error("User was deleted"));
  }
  req.userId = userId;
  next();
});

exports.getUserId = catchAsync(async (req, res, next) => {
  const { userId } = req;
  return res.json({ id: userId });
});
