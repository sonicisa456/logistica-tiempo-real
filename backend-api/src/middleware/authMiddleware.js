const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/errors");

const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token de autenticacion requerido", 401));
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch (_error) {
    return next(new AppError("Token invalido o expirado", 401));
  }
};

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return next(new AppError("No tienes permisos para acceder a este recurso", 403));
  }

  return next();
};

module.exports = {
  authenticate,
  authorizeRoles
};
