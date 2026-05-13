const createCrudService = require("./crudServiceFactory");
const vehicleModel = require("../models/vehicleModel");

module.exports = createCrudService(vehicleModel, "Vehiculo", ["nombre"]);
