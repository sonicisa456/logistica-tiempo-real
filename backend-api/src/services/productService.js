const createCrudService = require("./crudServiceFactory");
const productModel = require("../models/productModel");

module.exports = createCrudService(productModel, "Producto", ["nombre", "categoria"]);
