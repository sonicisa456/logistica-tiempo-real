const fs = require("fs");
const path = require("path");
const winston = require("winston");

const logsDir = path.resolve(__dirname, "../../../logs");
fs.mkdirSync(logsDir, { recursive: true });

const timestamp = winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" });
const lineFormat = winston.format.printf(({ timestamp: time, level, message }) => {
  return `[${time}] ${level.toUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(timestamp, lineFormat),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "app.log")
    }),
    new winston.transports.Console()
  ]
});

module.exports = logger;
