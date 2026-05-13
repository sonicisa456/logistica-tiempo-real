const createCrudController = require("./crudControllerFactory");
const orderService = require("../services/orderService");

module.exports = createCrudController(orderService);
