const asyncHandler = require("../utils/asyncHandler");

const createCrudController = (service) => ({
  list: asyncHandler(async (_req, res) => {
    const data = await service.list();
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    res.status(204).send();
  })
});

module.exports = createCrudController;
