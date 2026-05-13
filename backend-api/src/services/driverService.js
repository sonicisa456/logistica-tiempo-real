const createCrudService = require("./crudServiceFactory");
const driverModel = require("../models/driverModel");

module.exports = createCrudService(driverModel, "Conductor", ["nombre"]);
