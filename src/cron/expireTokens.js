const cron = require("node-cron");
const WhitelistedToken = require("../models/whitelistedToken.model");
const BlacklistedToken = require("../models/blacklistedToken.model");

cron.schedule("0 0 * * *", async () => {
  // chạy mỗi ngày
  try {
    const now = new Date();

    // Tìm các token đã hết hạn
    const expiredTokens = await WhitelistedToken.find({
      expiredAt: { $lte: now }
    });

    for (const tokenDoc of expiredTokens) {
      // Thêm vào blacklist
      await BlacklistedToken.create({
        token: tokenDoc.token
      });

      // Xoá khỏi whitelist
      await WhitelistedToken.deleteOne({ _id: tokenDoc._id });
    }

    console.log(
      `[Cron] Chuyển ${expiredTokens.length} token hết hạn sang blacklist.`
    );
  } catch (err) {
    console.error("[Cron] Lỗi khi xử lý token hết hạn:", err);
  }
});
