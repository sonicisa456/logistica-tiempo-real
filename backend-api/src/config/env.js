const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "logistica"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_logistica",
    expiresIn: process.env.JWT_EXPIRES_IN || "8h"
  },
  admin: {
    nombre: process.env.ADMIN_NAME || "Administrador",
    correo: process.env.ADMIN_EMAIL || "admin@logistica.local",
    password: process.env.ADMIN_PASSWORD || "Admin123!",
    rol: process.env.ADMIN_ROLE || "admin"
  },
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173"
};

module.exports = env;
