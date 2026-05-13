const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "vehiculos";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);
const remove = (id) => baseModel.remove(table, id);

const create = async ({ nombre, estado, ubicacion }) => {
  const [result] = await pool.query(
    "INSERT INTO vehiculos (nombre, estado, ubicacion) VALUES (?, ?, ?)",
    [nombre, estado || "disponible", ubicacion || null]
  );
  return findById(result.insertId);
};

const update = async (id, { nombre, estado, ubicacion }) => {
  await pool.query(
    `UPDATE vehiculos
     SET nombre = COALESCE(?, nombre),
         estado = COALESCE(?, estado),
         ubicacion = COALESCE(?, ubicacion)
     WHERE id = ?`,
    [nombre, estado, ubicacion, id]
  );
  return findById(id);
};

module.exports = {
  create,
  findAll,
  findById,
  remove,
  update
};
