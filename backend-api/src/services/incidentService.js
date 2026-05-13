const createCrudService = require("./crudServiceFactory");
const incidentModel = require("../models/incidentModel");

module.exports = createCrudService(incidentModel, "Incidencia", ["descripcion"]);
