const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signin/new_token", authController.refreshToken);
router.get("/logout", authController.logout);

router.use(authController.protect);
router.get("/info", authController.getUserId);

// router.use("/", (req, res) => {
//   res.send("from userRouter");
// });

module.exports = router;
