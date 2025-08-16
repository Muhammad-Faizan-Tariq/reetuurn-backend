import winston from "winston";
import config from "../config/index.js";

const serviceLogger = winston.createLogger({
  level: config.logging.level || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/service-errors.log",
      level: "error",
    }),
  ],
});

export default serviceLogger;
