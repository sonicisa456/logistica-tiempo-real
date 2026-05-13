const baseModel = require("./baseModel");

const table = "estados_entrega";

module.exports = {
  findAll: () => baseModel.findAll(table),
  findById: (id) => baseModel.findById(table, id),
  remove: (id) => baseModel.remove(table, id)
};
