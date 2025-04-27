const responseFormat = require("../utils/response");
const authService = require("../services/auth.service");
const AppError = require("../utils/appError");

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return responseFormat.success(
      res,
      user,
      "Đăng kí thành công, vui lòng vào email để lấy mã xác thực tài khoản",
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

exports.verifyEmail = async (req, res) => {
  try {
    const user = await authService.verifyEmail(req.body.email, req.body.otp);
    return responseFormat.success(
      res,
      user,
      "Xác thực tài khoản thành công, vui lòng đăng nhập!"
    );
  } catch (error) {
    if (error instanceof AppError) {
      return responseFormat.error(
        res,
        error.message,
        error.errorCode,
        error.statusCode
      );
    }

    return responseFormat.error(res, "Đã có lỗi xảy ra. Vui lòng thử lại.");
  }
};

exports.resendEmail = async (req, res) => {
  try {
    const user = await authService.resendEmail(req.body.email);
    return responseFormat.success(res, user, "Gửi OTP về email thành công!");
  } catch (error) {
    if (error instanceof AppError) {
      return responseFormat.error(
        res,
        error.message,
        error.errorCode,
        error.statusCode
      );
    }

    return responseFormat.error(res, "Đã có lỗi xảy ra. Vui lòng thử lại.");
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
    return responseFormat.success(res, user, "Đăng xuất thành công!");
  } catch (error) {
    return responseFormat.error(res, error.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await authService.changePassword(req.user.id, req.body);
    return responseFormat.success(
      res,
      user,
      "Thay đổi mật khẩu thành công, vui lòng đăng nhập lại!"
    );
  } catch (error) {
    return responseFormat.error(res, error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await authService.resetPassword(req.query.email);
    return responseFormat.success(
      res,
      user,
      "Mật khẩu mới đã được gửi về email của bạn, vui lòng kiểm tra hộp thư!"
    );
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
