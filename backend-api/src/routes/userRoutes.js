const createCrudRoutes = require("./crudRoutesFactory");
const userController = require("../controllers/userController");

module.exports = createCrudRoutes(userController);
