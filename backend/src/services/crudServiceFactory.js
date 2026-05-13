const AppError = require("../utils/errors");

const createCrudService = (model, entityName, requiredFields = []) => {
  const validateRequiredFields = (data) => {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new AppError(`Campos requeridos: ${missing.join(", ")}`, 400);
    }
  };

  const list = () => model.findAll();

  const getById = async (id) => {
    const item = await model.findById(id);
    if (!item) throw new AppError(`${entityName} no encontrado`, 404);
    return item;
  };

  const create = async (data) => {
    validateRequiredFields(data);
    return model.create(data);
  };

  const update = async (id, data) => {
    await getById(id);
    return model.update(id, data);
  };

  const remove = async (id) => {
    const deleted = await model.remove(id);
    if (!deleted) throw new AppError(`${entityName} no encontrado`, 404);
  };

  return {
    create,
    getById,
    list,
    remove,
    update
  };
};

module.exports = createCrudService;
