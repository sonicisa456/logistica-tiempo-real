const router = require("express").Router();
const publicController = require("../controllers/publicController");

router.get("/productos", publicController.listProducts);
router.post("/pedidos", publicController.createOrder);
router.get("/rastreo/:trackingCode", publicController.trackOrder);
router.post("/contacto", publicController.createContact);

module.exports = router;
