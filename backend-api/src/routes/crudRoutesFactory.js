const express = require("express");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const createCrudRoutes = (controller) => {
  const router = express.Router();

  router.use(authenticate, authorizeRoles("admin"));
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
};

module.exports = createCrudRoutes;
