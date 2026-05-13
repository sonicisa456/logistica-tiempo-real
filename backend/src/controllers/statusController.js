const statusService = require("../services/statusService");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (_req, res) => {
  const data = await statusService.list();
  res.json({ success: true, data });
});

module.exports = {
  list
};
