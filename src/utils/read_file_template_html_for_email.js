const fs = require("fs");
const path = require("path");

exports.readTemplate = function (template_path) {
  // Đọc nội dung template từ file
  const templatePath = path.join(__dirname, template_path);
  const template = fs.readFileSync(templatePath, "utf8");
  return template;
};
