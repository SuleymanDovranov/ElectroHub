const { SubCategories } = require("./../../models");
const AppError = require("./../../utils/appError");
const catchAsync = require("./../../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("img");

exports.add = catchAsync(async (req, res, next) => {
  var { name, categoryId } = req.body;
  if (!name || categoryId) return next(new AppError("Name is empty!", 404));
  let img = req.file.buffer;
  const newImgName = `${Date.now()}.webp`;
  await sharp(img)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`images/subCategory/${newImgName}`);

  const subCategory = await SubCategories.create({
    name,
    categoryId,
    img: newImgName,
  });

  subCategory.img = `${req.protocol}://${req.get(
    "host"
  )}/images/subCategory/${newImgName}`;
  return res.status(201).send(subCategory);
});

exports.getAll = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategories.findAll();
  if (!subCategory) return next(new AppError("No SubCategories yet!", 404));
  return res.status(201).send(
    subCategory.map((n) => {
      const { img, ...other } = n.toJSON();
      return {
        img: `${req.protocol}://${req.get("host")}/images/subCategory/${img}`,
        ...other,
      };
    })
  );
});

exports.edit = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategories.findOne({
    where: { uuid: req.params.uuid },
  });
  console.log("@@@", req.body);
  if (!subCategory) return next(new AppError("Not found", 404));
  let name = req.body.name || subCategory.name;
  let categoryId = req.body.categoryId || subCategory.categoryId;
  if (req.file) {
    let rubbish = `images/subCategory/${subCategory.img}`;
    let newImgName = `${Date.now()}.webp`;
    await sharp(req.file.buffer)
      .toFormat("webp")
      .webp({ quality: 70 })
      .toFile(`images/subCategory/${newImgName}`);
    fs.unlink(rubbish, (err) => {
      if (err) {
        console.log(`Error deleteing this file ${rubbish}`);
      } else {
        console.log(`${rubbish} has been successfully  deleted! `);
      }
    });
    await subCategory.update({ img: newImgName });
  }

  await subCategory.update({ name: name, categoryId: categoryId });
  subCategory.img = `${req.protocol}://${req.get("host")}/images/subCategory/${
    subCategory.img
  }`;
  return res.status(201).send(subCategory);
});

exports.getOne = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!subCategory) return next(new AppError("Not found!", 404));
  subCategory.img = `${req.protocol}://${req.get("host")}/images/subCategory/${
    subCategory.img
  }`;
  return res.status(201).send(subCategory);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategories.findOne({
    where: { uuid: req.params.uuid },
  });
  if (!subCategory) return next(new AppError("Not found!", 404));
  let rubbish = `images/subCategory/${subCategory.img}`;
  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Error deleteing this file ${rubbish}`);
    } else {
      console.log(`${rubbish} has been successfully  deleted ! `);
    }
  });
  await subCategory.destroy();
  return res.status(201).send({ msg: "deleted" });
});
