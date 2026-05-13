const contactService = require("../services/contactService");
const orderService = require("../services/orderService");
const productModel = require("../models/productModel");
const orderItemModel = require("../models/orderItemModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/errors");

const buildTrackingCode = (id) => `LR-${String(id).padStart(6, "0")}`;

const extractId = (trackingCode) => {
  const value = String(trackingCode || "").trim().replace(/^LR-/i, "");
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Codigo de rastreo invalido", 400);
  }
  return id;
};

const createOrder = asyncHandler(async (req, res) => {
  const productos = Array.isArray(req.body.productos) ? req.body.productos : [];
  let total = 0;
  const items = [];

  if (!req.body.cliente || !req.body.destino) {
    throw new AppError("Cliente y destino son requeridos", 400);
  }

  if (productos.length === 0) {
    throw new AppError("Agrega al menos un producto al carrito", 400);
  }

  for (const item of productos) {
    const product = await productModel.findById(item.id || item.producto_id);
    const quantity = Number(item.cantidad || 1);
    if (!product || quantity <= 0) {
      throw new AppError("Producto invalido en el carrito", 400);
    }
    if (product.stock < quantity) {
      throw new AppError(`Stock insuficiente para ${product.nombre}`, 409);
    }

    const price = Number(product.precio);
    const subtotal = price * quantity;
    total += subtotal;
    items.push({
      producto_id: product.id,
      nombre: product.nombre,
      cantidad: quantity,
      precio: price,
      subtotal
    });
  }

  const order = await orderService.create({
    cliente: req.body.cliente,
    destino: req.body.destino,
    estado: "En preparacion",
    fecha: new Date(),
    conductor: null,
    total
  });

  const savedItems = await orderItemModel.createMany(order.id, items);
  for (const item of items) {
    await productModel.decreaseStock(item.producto_id, item.cantidad);
  }

  res.status(201).json({
    success: true,
    data: {
      ...order,
      total,
      productos: savedItems,
      trackingCode: buildTrackingCode(order.id)
    }
  });
});

const trackOrder = asyncHandler(async (req, res) => {
  const id = extractId(req.params.trackingCode);
  const order = await orderService.getById(id);

  res.json({
    success: true,
    data: {
      ...order,
      trackingCode: buildTrackingCode(order.id)
    }
  });
});

const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.create(req.body);
  res.status(201).json({ success: true, data: contact });
});

const listProducts = asyncHandler(async (_req, res) => {
  const products = await productModel.findAll();
  res.json({ success: true, data: products });
});

module.exports = {
  createContact,
  createOrder,
  listProducts,
  trackOrder
};
