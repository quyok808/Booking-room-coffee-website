const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
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
        "Vui lòng đăng nhập để thực hiện chức năng này."
      );
    }

    // 2. Kiểm tra token có trong danh sách đen
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      return responseUtils.unauthorized(
        res,
        "Phiên đăng nhập không tồn tại, vui lòng đăng nhập lại."
      );
    }

    // 3. Xác thực token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 4. Kiểm tra user tồn tại
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return responseUtils.unauthorized(
        res,
        "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."
      );
    }

    // 5. Kiểm tra thay đổi mật khẩu (nếu có)
    if (currentUser.changedAfter && currentUser.changedAfter(decoded.iat)) {
      return responseUtils.unauthorized(
        res,
        "Tài khoản đã được thay đổi mật khẩu, vui lòng đăng nhập lại."
      );
    }

    // 6. Gán user vào request và tiếp tục
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return responseUtils.unauthorized(
        res,
        "Có lỗi xảy ra trong quá trình xác thực, vui lòng đăng nhập lại."
      );
    }
    if (error.name === "TokenExpiredError") {
      return responseUtils.unauthorized(
        res,
        "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"
      );
    }
    return responseUtils.error(res, "Lỗi xác thực !");
  }
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id).populate("role", "name");

    const userRoleNames = user.role.map((r) => r.name);

    const hasPermission = userRoleNames.some((roleName) =>
      roles.includes(roleName)
    );

    if (!hasPermission) {
      return responseUtils.unauthorized(
        res,
        "Bạn không có quyền để thực hiện chức năng này. Nếu đây là sự nhầm lẫn vui lòng liên hệ QTV để giải quyết.",
        403
      );
    }
    next();
  };
};
