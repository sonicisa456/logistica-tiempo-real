const createCrudRoutes = require("./crudRoutesFactory");
const driverController = require("../controllers/driverController");

module.exports = createCrudRoutes(driverController);
