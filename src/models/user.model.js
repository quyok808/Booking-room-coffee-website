const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    userName: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    address: { type: String },
    password: { type: String, required: true },
    role: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    photo: {
      type: String,
      default:
        "https://res.cloudinary.com/dscrgyvj0/image/upload/v1744610929/defaultAvatar_vpgqz6.jpg"
    },
    active: { type: Boolean, default: false },
    lock: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    otp: String,
    otpExpires: Date
  },
  { timestamps: true }
);

// Middleware để băm mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Phương thức để so sánh mật khẩu
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Tạo token để reset mật khẩu
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 phút
  return resetToken;
};

// Tạo OTP với chiều dài tùy chỉnh
userSchema.methods.createOTP = function (length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();

  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút
  return otp;
};

// Kiểm tra OTP hợp lệ
userSchema.methods.verifyOTP = function (otp) {
  if (!this.otp || !this.otpExpires) {
    console.log("null: ", this.otp, this.otpExpires);
    return false;
  }
  if (Date.now() > this.otpExpires) {
    console.log("exprired");
    return false;
  }
  return this.otp === otp;
};

// Kiểm tra mật khẩu đã thay đổi sau khi tạo JWT
userSchema.methods.changedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model("User", userSchema);
