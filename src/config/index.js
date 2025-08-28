import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

export default {
  env: process.env.NODE_ENV || "development",
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    apiVersion: "2024-04-10",
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    secret: process.env.PAYPAL_SECRET,
    environment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
  },
  database: {
    uri: process.env.MONGO_URI,
    name: process.env.DB_NAME || "return_management",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    dir: process.env.LOG_DIR || "logs",
    logToFile: process.env.LOG_TO_FILE === "true",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
};
