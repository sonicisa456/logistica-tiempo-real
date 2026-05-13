const createCrudRoutes = require("./crudRoutesFactory");
const incidentController = require("../controllers/incidentController");

module.exports = createCrudRoutes(incidentController);
