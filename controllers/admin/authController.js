const AppError = require('./../../utils/appError');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin } = require('./../../models');
const catchAsync = require('./../../utils/catchAsync');
const uuid = require('uuid');

const signToken = (id) => {
  return jwt.sign({ id }, 'suleyman', {
    expiresIn: '24h',
  });
};

const createSendToken = (admin, statusCode, res) => {
  const token = signToken(admin.uuid);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });
  res.status(statusCode).json({ token });
};

exports.login = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password)
    return next(new AppError('Hayys Adynyz bn passwordynyzy girizin!', 400));
  const admin = await Admin.findOne({ where: { name } });
  if (!admin || !(await bcrypt.compare(password, admin.password)))
    return next(new AppError('Yalnysh Kod ya-da adynyz!!!', 400));
  createSendToken(admin, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('You are not logged as an Admin!', 401));
  const decoded = await promisify(jwt.verify)(token, 'suleyman');

  const freshAdmin = await Admin.findOne({ where: { uuid: decoded.id } });
  if (!freshAdmin)
    return next(
      new AppError('The user belonging to this token is no longer exists', 401)
    );

  req.admin = freshAdmin;
  next();
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  const admin = await Admin.findOne({ where: { id: req.admin.id } });

  if (req.body.password)
    req.body.password = await bcrypt.hash(`${req.body.password}`, 12);

  admin.uuid = uuid.v4();
  await Object.assign(admin, req.body);
  await admin.save();

  createSendToken(admin, 200, res);
});
