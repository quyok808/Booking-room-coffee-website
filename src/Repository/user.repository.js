const userModel = require("../models/user.model");
const WhitelistedTokenModel = require("../models/whitelistedToken.model");
const BlacklistedToken = require("../models/blacklistedToken.model");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const whitelistedTokenModel = require("../models/whitelistedToken.model");
const blacklistedTokenModel = require("../models/blacklistedToken.model");

exports.registerUser = async (user) => {
  try {
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
    const loggedOutUser = await userModel.logout(id);
    return loggedOutUser;
  } catch (error) {
    throw error;
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
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
    const token = signToken(userInDatabase._id);

    // LƯU TOKEN MỚI VÀO WHITELIST
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 30);

    await whitelistedTokenModel.create({
      userId: userInDatabase._id,
      token
    });
    return token;
  } catch (error) {
    throw error;
  }
};
