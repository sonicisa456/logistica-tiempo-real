const createCrudRoutes = require("./crudRoutesFactory");
const vehicleController = require("../controllers/vehicleController");

module.exports = createCrudRoutes(vehicleController);
