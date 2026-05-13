const { pool } = require("../config/database");
const baseModel = require("./baseModel");

const table = "productos";

const findAll = () => baseModel.findAll(table);
const findById = (id) => baseModel.findById(table, id);
const remove = (id) => baseModel.remove(table, id);

const create = async ({ nombre, precio, stock, categoria, imagen, descripcion }) => {
  const [result] = await pool.query(
    "INSERT INTO productos (nombre, precio, stock, categoria, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, precio || 0, stock || 0, categoria, imagen || null, descripcion || null]
  );
  return findById(result.insertId);
};

const update = async (id, { nombre, precio, stock, categoria, imagen, descripcion }) => {
  await pool.query(
    `UPDATE productos
     SET nombre = COALESCE(?, nombre),
         precio = COALESCE(?, precio),
         stock = COALESCE(?, stock),
         categoria = COALESCE(?, categoria),
         imagen = COALESCE(?, imagen),
         descripcion = COALESCE(?, descripcion)
     WHERE id = ?`,
    [nombre, precio, stock, categoria, imagen, descripcion, id]
  );
  return findById(id);
};

const decreaseStock = async (id, quantity) => {
  await pool.query("UPDATE productos SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [quantity, id]);
};

module.exports = {
  create,
  decreaseStock,
  findAll,
  findById,
  remove,
  update
};
