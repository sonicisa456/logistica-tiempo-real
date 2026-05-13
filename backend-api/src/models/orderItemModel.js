const { pool } = require("../config/database");

const createMany = async (pedidoId, items) => {
  if (!items.length) return [];

  const values = items.map((item) => [
    pedidoId,
    item.producto_id || item.id || null,
    item.nombre,
    item.cantidad,
    item.precio,
    item.subtotal
  ]);

  await pool.query(
    "INSERT INTO pedido_productos (pedido_id, producto_id, nombre, cantidad, precio, subtotal) VALUES ?",
    [values]
  );

  const [rows] = await pool.query("SELECT * FROM pedido_productos WHERE pedido_id = ?", [pedidoId]);
  return rows;
};

const findByPedidoId = async (pedidoId) => {
  const [rows] = await pool.query("SELECT * FROM pedido_productos WHERE pedido_id = ?", [pedidoId]);
  return rows;
};

const findByPedidoIds = async (pedidoIds) => {
  if (!pedidoIds.length) return [];
  const [rows] = await pool.query("SELECT * FROM pedido_productos WHERE pedido_id IN (?)", [pedidoIds]);
  return rows;
};

module.exports = {
  createMany,
  findByPedidoId,
  findByPedidoIds
};
