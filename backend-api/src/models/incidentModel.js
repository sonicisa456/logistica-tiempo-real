const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "incidencias";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);
const remove = (id) => baseModel.remove(table, id);

const create = async ({ descripcion, fecha, prioridad }) => {
  const [result] = await pool.query(
    "INSERT INTO incidencias (descripcion, fecha, prioridad) VALUES (?, ?, ?)",
    [descripcion, fecha || null, prioridad || "media"]
  );
  return findById(result.insertId);
};

const update = async (id, { descripcion, fecha, prioridad }) => {
  await pool.query(
    `UPDATE incidencias
     SET descripcion = COALESCE(?, descripcion),
         fecha = COALESCE(?, fecha),
         prioridad = COALESCE(?, prioridad)
     WHERE id = ?`,
    [descripcion, fecha, prioridad, id]
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
