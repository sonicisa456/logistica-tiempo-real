const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "conductores";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);
const remove = (id) => baseModel.remove(table, id);

const create = async ({ nombre, telefono, ruta, estado }) => {
  const [result] = await pool.query(
    "INSERT INTO conductores (nombre, telefono, ruta, estado) VALUES (?, ?, ?, ?)",
    [nombre, telefono || null, ruta || null, estado || "disponible"]
  );
  return findById(result.insertId);
};

const update = async (id, { nombre, telefono, ruta, estado }) => {
  await pool.query(
    `UPDATE conductores
     SET nombre = COALESCE(?, nombre),
         telefono = COALESCE(?, telefono),
         ruta = COALESCE(?, ruta),
         estado = COALESCE(?, estado)
     WHERE id = ?`,
    [nombre, telefono, ruta, estado, id]
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
