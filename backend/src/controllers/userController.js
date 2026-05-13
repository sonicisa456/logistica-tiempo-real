const createCrudController = require("./crudControllerFactory");
const userService = require("../services/userService");

module.exports = createCrudController(userService);
