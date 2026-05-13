const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const logger = require("../config/logger");
const userModel = require("../models/userModel");
const AppError = require("../utils/errors");

const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  correo: user.correo,
  rol: user.rol
});

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

const login = async ({ correo, contrasena }) => {
  if (!correo || !contrasena) {
    throw new AppError("Correo y contrasena son requeridos", 400);
  }

  const user = await userModel.findByEmail(correo);
  const validPassword = user ? await bcrypt.compare(contrasena, user.contrasena) : false;

  if (!user || !validPassword) {
    logger.info(`Intento de login fallido para ${correo}`);
    throw new AppError("Credenciales invalidas", 401);
  }

  logger.info(`Usuario inicio sesion: ${user.correo}`);

  return {
    user: publicUser(user),
    token: createToken(user)
  };
};

module.exports = {
  login,
  publicUser
};
