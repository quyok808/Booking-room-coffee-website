const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const whitelistedTokenModel = require("../models/whitelistedToken.model");
const blacklistedTokenModel = require("../models/blacklistedToken.model");

const createOTP = function (length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
  return otp;
};

exports.registerUser = async (user) => {
  try {
    user.otp = createOTP(6);
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    const createdUser = await userModel.create(user);
    return createdUser;
  } catch (error) {
    throw error;
  }
};

exports.getAllUsers = async (skip, limit) => {
  try {
    const users = await userModel.find().skip(skip).limit(limit);
    return users;
  } catch (error) {
    throw error;
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await userModel.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
};

exports.getUserByUsername = async (username) => {
  try {
    const user = await userModel.findOne({ username });
    return user;
  } catch (error) {
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const user = await userModel.findOne({ email });
    return user;
  } catch (error) {
    throw error;
  }
};

exports.updateUser = async (id, user) => {
  try {
    const updatedUser = await userModel.findByIdAndUpdate(id, user, {
      new: true
    });
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(id);
    return deletedUser;
  } catch (error) {
    throw error;
  }
};

exports.countUsers = async () => {
  try {
    const count = await userModel.countDocuments();
    return count;
  } catch (error) {
    throw error;
  }
};

exports.getUsersByRole = async (role) => {
  try {
    const users = await userModel.find({ role });
    return users;
  } catch (error) {
    throw error;
  }
};

exports.logout = async (id) => {
  try {
    const oldTokenDoc = await whitelistedTokenModel.findOne({
      userId: id
    });
    if (oldTokenDoc) {
      await blacklistedTokenModel.create({ token: oldTokenDoc.token });
      await whitelistedTokenModel.deleteOne({ _id: oldTokenDoc._id });
    }
    return {};
  } catch (error) {
    throw error;
  }
};

const signToken = (id, rememberme = false) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberme ? process.env.JWT_EXPIRES_IN : "1d"
  });
};

exports.login = async (user) => {
  try {
    const userInDatabase = await userModel
      .findOne({ userName: user.username })
      .select("+password");

    if (!userInDatabase) {
      throw new AppError(
        "Không tìm thấy thông tin người dùng!",
        "USER_NOT_FOUND",
        404
      );
    }

    const checkpass = await userInDatabase.comparePassword(
      user.password,
      userInDatabase.password
    );

    if (!checkpass) {
      throw new AppError(
        "Sai thông tin tài khoản hoặc mật khẩu!",
        "INVALID_CREDENTIALS",
        401
      );
    }

    if (!userInDatabase.active) {
      throw new AppError(
        "Tài khoản chưa được xác thực email!",
        "UNVERIFIED",
        401
      );
    }

    if (userInDatabase.lock) {
      throw new AppError(
        "Tài khoản hiện bị khoá, vui lòng liên hệ QTV để được giải quyết!",
        "LOCKED",
        401
      );
    }

    // CHUYỂN TOKEN CŨ (nếu có) sang blacklist
    const oldTokenDoc = await whitelistedTokenModel.findOne({
      userId: userInDatabase._id
    });
    if (oldTokenDoc) {
      await blacklistedTokenModel.create({ token: oldTokenDoc.token });
      await whitelistedTokenModel.deleteOne({ _id: oldTokenDoc._id });
    }

    // TẠO TOKEN MỚI
    const token = signToken(userInDatabase._id, user.rememberme);

    // LƯU TOKEN MỚI VÀO WHITELIST
    const expiredAt = new Date();
    expiredAt.setDate(
      user.rememberme === true
        ? expiredAt.getDate() + 30
        : expiredAt.getDate() + 1
    );

    await whitelistedTokenModel.create({
      userId: userInDatabase._id,
      token,
      expiredAt
    });
    return token;
  } catch (error) {
    throw error;
  }
};

exports.updatePassword = async (id, user) => {
  try {
    const existingUser = await userModel.findById(id).select("+password");
    if (!existingUser) {
      throw new AppError(
        "Không tìm thấy thông tin người dùng!",
        "USER_NOT_FOUND",
        404
      );
    }
    const checkPass = await existingUser.comparePassword(
      user.password,
      existingUser.password
    );

    if (!checkPass) {
      throw new AppError("Sai mật khẩu!", "INVALID_CREDENTIALS", 401);
    }

    // Kiểm tra xem user có chứa mật khẩu mới hay không
    if (user.password === user.newPassword) {
      throw new AppError(
        "Mật khẩu này trùng với mật khẩu cũ, vui lòng sử dụng 1 mật khẩu khác",
        "CONFLICT_PASSWORD",
        409
      );
    }

    if (user.newPassword !== user.confirmPassword) {
      throw new AppError(
        "Xác nhận mật khẩu không khớp, vui lòng kiểm tra lại",
        "CONFLICT_PASSWORD",
        409
      );
    }

    if (!user.password || !user.newPassword || !user.confirmPassword) {
      throw new AppError("Vui lòng điền đầy đủ thông tin", "BAD_REQUEST", 400);
    }

    existingUser.password = user.newPassword;

    const updatedUser = await existingUser.save();

    const oldTokenDoc = await whitelistedTokenModel.findOne({
      userId: id
    });
    if (oldTokenDoc) {
      await blacklistedTokenModel.create({ token: oldTokenDoc.token });
      await whitelistedTokenModel.deleteOne({ _id: oldTokenDoc._id });
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
