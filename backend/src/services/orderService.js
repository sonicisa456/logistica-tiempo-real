const createCrudService = require("./crudServiceFactory");
const orderModel = require("../models/orderModel");

module.exports = createCrudService(orderModel, "Pedido", ["cliente", "destino"]);
