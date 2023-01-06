const path = require("path");
const multer = require("multer");
// const fs = require("fs").promises;
const fs = require("fs");
const { promisify } = require("util");

const catchAsync = require("../utils/catchAsync");
const File = require("../models/fileModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync("./files", { recursive: true });
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

exports.fileUpload = upload.any();
// exports.fileUpload = upload.single("file");
exports.createFileDataDB = catchAsync(async (req, res, next) => {
  if (!req.file && !req.files) {
    return next(new Error("No files were uploaded"));
  }
  const fileArray = [];
  for (let i = 0; i < req.files.length; i++) {
    const currentFile = req.files[i];
    const words = currentFile.filename.split(".");
    const extensionName = words[words.length - 1];
    const file = await File.create({
      fileName: currentFile.filename,
      extensionName: extensionName,
      mimeType: currentFile.mimetype,
      fileSize: currentFile.size,
    });
    fileArray.push(file);
  }
  return res.json({ files: fileArray });
});

exports.getAllFiles = catchAsync(async (req, res, next) => {
  limit = +req.query.list_size || 10;
  page = +req.query.page || 1;
  const files = await File.findAll({
    limit,
    offset: limit * (page - 1),
  });
  return res.status(200).json({ files });
});

exports.getFileById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new Error("Please provide correct id of file"));
  }
  const file = await File.findOne({ where: { id } });
  if (!file) {
    return next(new Error("No file was founded with this id"));
  }
  return res.status(200).json({ file });
});

exports.deleteFileById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new Error("Please provide correct id of file"));
  }
  const file = await File.findOne({ where: { id } });
  if (!file) {
    return next(new Error("No files was found with this id"));
  }

  await fs.promises.unlink(path.join("./files", file.fileName));
  await File.destroy({ where: { id } });

  return res.status(200).json({ message: "success" });
});

exports.downloadFile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new Error("Please provide correct id of file"));
  }
  const file = await File.findOne({ where: { id } });
  if (!file) {
    return next(new Error("No files was found with this id"));
  }
  const relativePath = path.join("./files", file.fileName);
  // TODO: make tihs function with promise if available
  return res.download(relativePath, (err) => {
    if (err) {
      return res.json({ message: "Something went wrong" });
    }
  });
});

exports.updateFile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new Error("Please provide id of file"));
  }
  if (!req.file && !req.files) {
    return next(new Error("No files were uploaded"));
  }
  const currentFile = req.files[0];
  const file = await File.findOne({ where: { id } });
  if (!file) {
    await fs.promises.unlink(path.join("./files", currentFile.filename));
    return next(new Error("No files was found with this id"));
  }
  const words = currentFile.filename.split(".");
  const extensionName = words[words.length - 1];
  await fs.promises.unlink(path.join("./files", file.fileName));
  file.fileName = currentFile.filename;
  file.extensionName = extensionName;
  file.mimeType = currentFile.mimetype;
  file.fileSize = currentFile.size;
  await file.save();
  return res.status(200).json({ message: "File updated successfully" });
});
