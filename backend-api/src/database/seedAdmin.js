const bcrypt = require("bcryptjs");
const env = require("../config/env");
const logger = require("../config/logger");
const userModel = require("../models/userModel");

const seedAdmin = async () => {
  const adminAccounts = [
    {
      nombre: env.admin.nombre,
      correo: env.admin.correo,
      password: env.admin.password,
      rol: env.admin.rol
    },
    {
      nombre: "Administrador 2",
      correo: "admin2@logistica.local",
      password: "Admin123!",
      rol: "admin"
    },
    {
      nombre: "Administrador 3",
      correo: "admin3@logistica.local",
      password: "Admin123!",
      rol: "admin"
    },
    {
      nombre: "Administrador 4",
      correo: "admin4@logistica.local",
      password: "Admin123!",
      rol: "admin"
    },
    {
      nombre: "Gael",
      correo: "gael029@gmail.com",
      password: "Admin123!",
      rol: "admin"
    },
    {
      nombre: "Ricardo",
      correo: "ricardo@gmail.com",
      password: "Admin123!",
      rol: "admin"
    },
    {
      nombre: "Isaias",
      correo: "isaias@gamil.com",
      password: "Admin123!",
      rol: "admin"
    }
  ];

  for (const account of adminAccounts) {
    const existingAdmin = await userModel.findByEmail(account.correo);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(account.password, 10);

      await userModel.create({
        nombre: account.nombre,
        correo: account.correo,
        contrasena: hashedPassword,
        rol: account.rol
      });

      logger.info(`Usuario administrador creado: ${account.correo}`);
    }
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
