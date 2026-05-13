const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "usuarios";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);
const remove = (id) => baseModel.remove(table, id);

const findByEmail = async (correo) => {
  const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ? LIMIT 1", [correo]);
  return rows[0] || null;
};

const create = async ({ nombre, correo, contrasena, rol }) => {
  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)",
    [nombre, correo, contrasena, rol || "operador"]
  );
  return findById(result.insertId);
};

const update = async (id, { nombre, correo, contrasena, rol }) => {
  await pool.query(
    `UPDATE usuarios
     SET nombre = COALESCE(?, nombre),
         correo = COALESCE(?, correo),
         contrasena = COALESCE(?, contrasena),
         rol = COALESCE(?, rol)
     WHERE id = ?`,
    [nombre, correo, contrasena, rol, id]
  );
  return findById(id);
};

module.exports = {
  create,
  findAll,
  findByEmail,
  findById,
  remove,
  update
};
