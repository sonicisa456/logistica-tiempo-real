const bcrypt = require("bcryptjs");
const env = require("../config/env");
const logger = require("../config/logger");
const userModel = require("../models/userModel");

const seedAdmin = async () => {
  const existingAdmin = await userModel.findByEmail(env.admin.correo);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(env.admin.password, 10);

    await userModel.create({
      nombre: env.admin.nombre,
      correo: env.admin.correo,
      contrasena: hashedPassword,
      rol: env.admin.rol
    });

    logger.info(`Usuario administrador creado: ${env.admin.correo}`);
  }

  const normalEmail = "cliente@logistica.local";
  const existingUser = await userModel.findByEmail(normalEmail);
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("Cliente123!", 10);

    await userModel.create({
      nombre: "Cliente Demo",
      correo: normalEmail,
      contrasena: hashedPassword,
      rol: "user"
    });

    logger.info(`Usuario normal creado: ${normalEmail}`);
  }
};

module.exports = seedAdmin;
