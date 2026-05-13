const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const AppError = require("../utils/errors");
const { publicUser } = require("./authService");

const list = async () => {
  const users = await userModel.findAll();
  return users.map(publicUser);
};

const getById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return publicUser(user);
};

const create = async (data) => {
  if (!data.nombre || !data.correo || !data.contrasena) {
    throw new AppError("Nombre, correo y contrasena son requeridos", 400);
  }

  const existing = await userModel.findByEmail(data.correo);
  if (existing) throw new AppError("El correo ya esta registrado", 409);

  const hashedPassword = await bcrypt.hash(data.contrasena, 10);
  const user = await userModel.create({
    ...data,
    contrasena: hashedPassword
  });

  return publicUser(user);
};

const update = async (id, data) => {
  const currentUser = await userModel.findById(id);
  if (!currentUser) throw new AppError("Usuario no encontrado", 404);

  const payload = { ...data };
  if (payload.contrasena) {
    payload.contrasena = await bcrypt.hash(payload.contrasena, 10);
  }

  const user = await userModel.update(id, payload);
  return publicUser(user);
};

const remove = async (id) => {
  const deleted = await userModel.remove(id);
  if (!deleted) throw new AppError("Usuario no encontrado", 404);
};

module.exports = {
  create,
  getById,
  list,
  remove,
  update
};
