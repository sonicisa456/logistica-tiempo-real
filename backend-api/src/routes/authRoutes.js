const router = require("express").Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.get("/me", authenticate, authController.profile);

module.exports = router;
