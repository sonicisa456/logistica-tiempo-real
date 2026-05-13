const { pool } = require("../config/database");
const baseModel = require("./baseModel");
const orderItemModel = require("./orderItemModel");

const table = "pedidos";

const attachItems = async (orders) => {
  const ids = orders.map((order) => order.id);
  const items = await orderItemModel.findByPedidoIds(ids);
  return orders.map((order) => ({
    ...order,
    productos: items.filter((item) => item.pedido_id === order.id)
  }));
};

const findAll = async () => {
  const orders = await baseModel.findAll(table);
  return attachItems(orders);
};

const findById = async (id) => {
  const order = await baseModel.findById(table, id);
  if (!order) return null;
  const productos = await orderItemModel.findByPedidoId(id);
  return { ...order, productos };
};
const remove = (id) => baseModel.remove(table, id);

const create = async ({ cliente, destino, estado, fecha, conductor, total }) => {
  const [result] = await pool.query(
    "INSERT INTO pedidos (cliente, destino, estado, fecha, conductor, total) VALUES (?, ?, ?, ?, ?, ?)",
    [cliente, destino, estado || "pendiente", fecha || null, conductor || null, total || 0]
  );
  return findById(result.insertId);
};

const update = async (id, { cliente, destino, estado, fecha, conductor }) => {
  await pool.query(
    `UPDATE pedidos
     SET cliente = COALESCE(?, cliente),
         destino = COALESCE(?, destino),
         estado = COALESCE(?, estado),
         fecha = COALESCE(?, fecha),
         conductor = COALESCE(?, conductor)
     WHERE id = ?`,
    [cliente, destino, estado, fecha, conductor, id]
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
