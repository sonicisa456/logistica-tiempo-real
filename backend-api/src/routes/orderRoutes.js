const createCrudRoutes = require("./crudRoutesFactory");
const orderController = require("../controllers/orderController");

module.exports = createCrudRoutes(orderController);
