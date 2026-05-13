const contactModel = require("../models/contactModel");
const AppError = require("../utils/errors");

const list = () => contactModel.findAll();

const create = async (data) => {
  if (!data.nombre || !data.correo || !data.mensaje) {
    throw new AppError("Nombre, correo y mensaje son requeridos", 400);
  }

  return contactModel.create(data);
};

module.exports = {
  create,
  list
};
