const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/appError");
const BlacklistedToken = require("../models/blacklistedToken.model");
const responseUtils = require("../utils/response");
exports.protect = async (req, res, next) => {
  try {
    // 1. Kiểm tra token trong header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return responseUtils.unauthorized(
        res,
        "You are not logged in! Please log in to get access."
      );
    }

    // 2. Kiểm tra token có trong danh sách đen
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      return responseUtils.unauthorized(
        res,
        "Invalid token! Please log in again."
      );
    }

    // 3. Xác thực token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 4. Kiểm tra user tồn tại
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return responseUtils.unauthorized(
        res,
        "The user belonging to this token does no longer exist."
      );
    }

    // 5. Kiểm tra thay đổi mật khẩu (nếu có)
    if (currentUser.changedAfter && currentUser.changedAfter(decoded.iat)) {
      return responseUtils.unauthorized(
        res,
        "User recently changed password! Please log in again."
      );
    }

    // 6. Gán user vào request và tiếp tục
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return responseUtils.unauthorized(
        res,
        "Invalid token! Please log in again."
      );
    }
    if (error.name === "TokenExpiredError") {
      return responseUtils.unauthorized(
        res,
        "Your token has expired! Please log in again."
      );
    }
    return responseUtils.error(res, "Authentication failed.");
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return responseUtils.unauthorized(
        res,
        "You do not have permission to perform this action",
        403
      );
    }
    next();
  };
};
