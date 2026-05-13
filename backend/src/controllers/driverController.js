const createCrudController = require("./crudControllerFactory");
const driverService = require("../services/driverService");

module.exports = createCrudController(driverService);
