const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "contactos";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);

const create = async ({ nombre, correo, mensaje }) => {
  const [result] = await pool.query(
    "INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)",
    [nombre, correo, mensaje]
  );
  return findById(result.insertId);
};

module.exports = {
  create,
  findAll,
  findById
};
