const createCrudController = require("./crudControllerFactory");
const productService = require("../services/productService");

module.exports = createCrudController(productService);
