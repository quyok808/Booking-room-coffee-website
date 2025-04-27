const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyEmail);
router.post("/resend-otp", authController.resendEmail);
router.get("/reset-password", authController.resetPassword);
router.use(authMiddleware.protect);
router.post("/logout", authController.logout);
router.post("/change-password", authController.changePassword);

module.exports = router;
