const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const apiRoutes = require("./routes");

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (origin === env.corsOrigin) {
      return callback(null, true);
    }

    return callback(null, false);
  }
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a Logistica en Tiempo Real"
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
