const createCrudController = require("./crudControllerFactory");
const vehicleService = require("../services/vehicleService");

module.exports = createCrudController(vehicleService);
