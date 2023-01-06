const express = require("express");
const fileController = require("../controllers/fileController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.put(
  "/update/:id?",
  fileController.fileUpload,
  fileController.updateFile
);

router.post(
  "/upload",
  fileController.fileUpload,
  fileController.createFileDataDB
);

router.get("/list", fileController.getAllFiles);
router.delete("/delete/:id?", fileController.deleteFileById);
router.get("/download/:id?", fileController.downloadFile);
router.get("/:id?", fileController.getFileById);
module.exports = router;
