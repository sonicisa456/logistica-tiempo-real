const router = require("express").Router();
const statusController = require("../controllers/statusController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, authorizeRoles("admin"), statusController.list);

module.exports = router;
