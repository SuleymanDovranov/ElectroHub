const { Admin } = require("./../../models");
const AppError = require("./../../utils/appError");
const catchAsync = require("./../../utils/catchAsync");
const bcrypt = require("bcryptjs");

exports.addAdmin = catchAsync(async (req, res, next) => {
  // let password = req.body.password

  req.body.password = await bcrypt.hash(`${req.body.password}`, 12);

  const admin = await Admin.create(req.body);
  return res.status(201).send(admin);
});
