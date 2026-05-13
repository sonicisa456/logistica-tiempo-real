const statusModel = require("../models/statusModel");

const list = () => statusModel.findAll();

module.exports = {
  list
};
