const { Brands } = require('./../../models');
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
    .toFile(`images/brand/${newImgName}`);
  let name = req.body.name;
  if (!name) return next(new AppError('Name is empty!', 404));
  const brand = await Brands.create({ name, img: newImgName });

  brand.img = `${req.protocol}://${req.get('host')}/images/brand/${newImgName}`;
  return res.status(201).send(brand);
});

exports.getAll = catchAsync(async (req, res, next) => {
  const brand = await Brands.findAll();
  if (!brand) return next(new AppError('No Brands yet!', 404));
  return res.status(201).send(
    brand.map((n) => {
      const { img, ...other } = n.toJSON();
      return {
        img: `${req.protocol}://${req.get('host')}/images/brand/${img}`,
        ...other,
      };
    })
  );
});

exports.edit = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!brand) return next(new AppError('Not found', 404));
  let name = req.body.name || brand.name;
  if (req.file) {
    let rubbish = `images/brand/${brand.img}`;
    let newImgName = `${Date.now()}.webp`;
    await sharp(req.file.buffer)
      .toFormat('webp')
      .webp({ quality: 70 })
      .toFile(`/images/brand/${newImgName}`);
    fs.unlink(rubbish, (err) => {
      if (err) {
        console.log(`Error deleteing this file ${rubbish}`);
      } else {
        console.log(`${rubbish} has been successfully  deleted ! `);
      }
    });
    await brand.update({ img: newImgName });
  }

  await brand.update({ name });
  brand.img = `${req.protocol}://${req.get('host')}/images/brand/${brand.img}`;
  return res.status(201).send(brand);
});

exports.getOne = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!brand) return next(new AppError('Not found!', 404));
  brand.img = `${req.protocol}://${req.get('host')}/images/brand/${brand.img}`;
  return res.status(201).send(brand);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!brand) return next(new AppError('Not found!', 404));
  let rubbish = `images/brand/${brand.img}`;
  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Error deleteing this file ${rubbish}`);
    } else {
      console.log(`${rubbish} has been successfully  deleted ! `);
    }
  });
  await brand.destroy();
  return res.status(201).send({ msg: 'deleted' });
});
