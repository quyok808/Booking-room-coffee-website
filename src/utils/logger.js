const winston = require("winston");

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "DD-MM-YYYY|HH:mm:ss"
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    // new winston.transports.Console(), // Ghi log ra console
    new winston.transports.File({ filename: "logs/app.log" })
  ]
});

module.exports = logger;
