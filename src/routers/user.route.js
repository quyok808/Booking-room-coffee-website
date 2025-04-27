const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.use(authMiddleware.protect);
router.get("/", userController.getAllUsers);

router.get("search-by", userController.getUser);

module.exports = router;
