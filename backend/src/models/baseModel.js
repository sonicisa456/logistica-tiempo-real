const { pool } = require("../config/database");

const findAll = async (table) => {
  const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
  return rows;
};

const findById = async (table, id) => {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const remove = async (table, id) => {
  const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  findAll,
  findById,
  remove
};
