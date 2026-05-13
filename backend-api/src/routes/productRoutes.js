const createCrudRoutes = require("./crudRoutesFactory");
const productController = require("../controllers/productController");

module.exports = createCrudRoutes(productController);
