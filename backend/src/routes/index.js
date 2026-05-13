const router = require("express").Router();
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const orderRoutes = require("./orderRoutes");
const vehicleRoutes = require("./vehicleRoutes");
const incidentRoutes = require("./incidentRoutes");
const driverRoutes = require("./driverRoutes");
const statusRoutes = require("./statusRoutes");
const publicRoutes = require("./publicRoutes");
const productRoutes = require("./productRoutes");

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API Logistica en Tiempo Real funcionando"
  });
});

router.use("/auth", authRoutes);
router.use("/public", publicRoutes);
router.use("/usuarios", userRoutes);
router.use("/pedidos", orderRoutes);
router.use("/vehiculos", vehicleRoutes);
router.use("/incidencias", incidentRoutes);
router.use("/conductores", driverRoutes);
router.use("/estados", statusRoutes);
router.use("/productos", productRoutes);

module.exports = router;
