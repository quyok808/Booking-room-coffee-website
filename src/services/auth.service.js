const userRepository = require("../Repository/user.repository");
const roleRepository = require("../Repository/role.repository");
const Email = require("../configs/email");
const AppError = require("../utils/appError");
const template = require("../utils/read_file_template_html_for_email");

exports.register = async (user) => {
  try {
    user.role = await roleRepository.getRoleByName("user");
    const createdUser = await userRepository.registerUser(user);

    try {
      await Email.sendEmail({
        email: user.email,
        subject: "Mã OTP xác thực tài khoản",
        html: template
          .readTemplate(
            "../public/email_template/otp_verityEmail_template.html"
          )
          .replace("{{OTP_CODE}}", user.otp)
      });
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(
        "Có lỗi trong quá trình gửi email, vui lòng thử lại sau",
        "EMAIL_ERROR",
        500
      );
    }

    return createdUser;
  } catch (error) {
    throw error;
  }
};

exports.verifyEmail = async (email, otp) => {
  try {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new AppError(
        "Không tìm thấy thông tin người dùng!",
        "USER_NOT_FOUND",
        404
      );
    }

    if (!user.verifyOTP(otp)) {
      if (user.otp !== otp) {
        throw new AppError("Mã OTP không hợp lệ", "INVALID_OTP", 400);
      }

      if (Date.now() > user.otpExpires) {
        throw new AppError("Mã OTP hết hạn", "OTP_EXPIRED", 400);
      }
    }

    user.active = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
  } catch (error) {
    throw error;
  }
};

exports.resendEmail = async (email) => {
  try {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new AppError(
        "Không tìm thấy thông tin người dùng!",
        "USER_NOT_FOUND",
        404
      );
    }

    if (!user.otp || user.active == true) {
      throw new AppError("Tài khoản đã được xác thực", "OTP_VERIFIED", 400);
    }

    user.createOTP(6);
    await user.save({ validateBeforeSave: false });

    try {
      await Email.sendEmail({
        email: user.email,
        subject: "Mã OTP xác thực tài khoản",
        html: template
          .readTemplate(
            "../public/email_template/otp_verityEmail_template.html"
          )
          .replace("{{OTP_CODE}}", user.otp)
      });
    } catch (error) {
      console.log(error);
      throw new AppError(
        "Có lỗi trong quá trình gửi email, vui lòng thử lại sau",
        "EMAIL_ERROR",
        500
      );
    }

    return user;
  } catch (error) {
    throw error;
  }
};

exports.login = async (user) => {
  try {
    const loggedInUser = await userRepository.login(user);
    return loggedInUser;
  } catch (error) {
    throw error;
  }
};

exports.logout = async (id) => {
  try {
    const loggedOutUser = await userRepository.logout(id);
    return loggedOutUser;
  } catch (error) {
    throw error;
  }
};

exports.changePassword = async (id, user) => {
  try {
    const updatedUser = await userRepository.updatePassword(id, user);
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}

exports.resetPassword = async (email) => {
  try {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new AppError(
        "Không tìm thấy thông tin người dùng!",
        "USER_NOT_FOUND",
        404
      );
    }
    var newPassword = generatePassword(16);

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    try {
      await Email.sendEmail({
        email: user.email,
        subject: "Mật khẩu đã được đặt lại",
        html: `Mật khẩu mới của bạn là : ${newPassword}`
      });
    } catch (error) {
      console.log(error);
      throw new AppError(
        "Có lỗi trong quá trình gửi email, vui lòng thử lại sau",
        "EMAIL_ERROR",
        500
      );
    }

    return user;
  } catch (error) {
    throw error;
  }
};
