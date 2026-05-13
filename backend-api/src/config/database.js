const mysql = require("mysql2/promise");
const env = require("./env");
const logger = require("./logger");

const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

const testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    logger.info("Conexion a MySQL establecida");
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection
};
