const { Categories } = require('./../../models');
const AppError = require('./../../utils/appError');
const catchAsync = require('./../../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('img');

exports.add = catchAsync(async (req, res, next) => {
  let img = req.file.buffer;
  const newImgName = `${Date.now()}.webp`;
  await sharp(img)
    .toFormat('webp')
    .webp({ quality: 70 })
    .toFile(`images/category/${newImgName}`);
  let name = req.body.name;
  if (!name) return next(new AppError('Name is empty!', 404));
  const category = await Categories.create({ name, img: newImgName });

  category.img = `${req.protocol}://${req.get(
    'host'
  )}/images/category/${newImgName}`;
  return res.status(201).send(category);
});

exports.getAll = catchAsync(async (req, res, next) => {
  const category = await Categories.findAll();
  if (!category) return next(new AppError('No categories yet!', 404));
  return res.status(201).send(
    category.map((n) => {
      const { img, ...other } = n.toJSON();
      return {
        img: `${req.protocol}://${req.get('host')}/images/category/${img}`,
        ...other,
      };
    })
  );
});

exports.edit = catchAsync(async (req, res, next) => {
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!category) return next(new AppError('Not found', 404));
  let name = req.body.name || category.name;
  if (req.file) {
    let rubbish = `images/category/${category.img}`;
    let newImgName = `${Date.now()}.webp`;
    await sharp(req.file.buffer)
      .toFormat('webp')
      .webp({ quality: 70 })
      .toFile(`/images/category/${newImgName}`);
    fs.unlink(rubbish, (err) => {
      if (err) {
        console.log(`Error deleteing this file ${rubbish}`);
      } else {
        console.log(`${rubbish} has been successfully  deleted ! `);
      }
    });
    await category.update({ img: newImgName });
  }

  await category.update({ name });
  category.img = `${req.protocol}://${req.get('host')}/images/category/${
    category.img
  }`;
  return res.status(201).send(category);
});

exports.getOne = catchAsync(async (req, res, next) => {
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!category) return next(new AppError('Not found!', 404));
  category.img = `${req.protocol}://${req.get('host')}/images/category/${
    category.img
  }`;
  return res.status(201).send(category);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const category = await Categories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!category) return next(new AppError('Not found!', 404));
  let rubbish = `images/category/${category.img}`;
  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Error deleteing this file ${rubbish}`);
    } else {
      console.log(`${rubbish} has been successfully  deleted ! `);
    }
  });
  await category.destroy();
  return res.status(201).send({ msg: 'deleted' });
});
