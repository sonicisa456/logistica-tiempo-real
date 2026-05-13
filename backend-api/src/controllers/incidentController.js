const createCrudController = require("./crudControllerFactory");
const incidentService = require("../services/incidentService");

module.exports = createCrudController(incidentService);
