const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({
    success: true,
    data
  });
});

const profile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = {
  login,
  profile
};
