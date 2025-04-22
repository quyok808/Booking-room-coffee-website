const responseFormat = require("../utils/response");
const authService = require("../services/auth.service");
const AppError = require("../utils/appError");

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return responseFormat.success(
      res,
      user,
      "Đăng kí thành công, vui lòng đăng nhập vào tài khoản",
      201
    );
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return responseFormat.error(
        res,
        `${field.toLowerCase()} đã tồn tại, vui lòng chọn 1 giá trị khác`,
        `DUPPLICATE_${field.toUpperCase()}`,
        409
      );
    }
    return responseFormat.error(res, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    return responseFormat.success(res, user, "Đăng nhập thành công!");
  } catch (error) {
    // Nếu là AppError thì trả đúng format bạn đã chuẩn hoá
    if (error instanceof AppError) {
      return responseFormat.error(
        res,
        error.message,
        error.errorCode,
        error.statusCode
      );
    }

    // Còn lại là lỗi không đoán trước được
    return responseFormat.error(res, "Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await authService.logout(req.user.id);
    return responseFormat.success(res, user, "User logged out successfully");
  } catch (error) {
    return responseFormat.error(res, error.message);
  }
};
