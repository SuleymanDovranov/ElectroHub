const {
  Brands,
  Products,
  BrandImgs,
  SubCategories,
  SubCategoriesAndBrands,
} = require("./../../models");
const AppError = require("./../../utils/appError");
const catchAsync = require("./../../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

exports.add = catchAsync(async (req, res, next) => {
  let name = req.body.name;
  if (!name) return next(new AppError("Name is empty!", 404));
  const brand = await Brands.create({ name });
  if (req.body.subCategories) {
    for (subCategoryId of req.body.subCategories) {
      const cat = await SubCategories.findOne({ where: { id: subCategoryId } });
      if (!cat) return next(new AppError("SubCategories list not found", 404));
      await SubCategoriesAndBrands.create({
        subCategoryId: subCategoryId,
        brandId: brand.id,
      });
    }
  }
  return res.status(201).send(brand);
});

exports.addAsso = catchAsync(async (req, res, next) => {
  var { subCategoryId, brandId } = req.body;
  const brand = await Brands.findOne({ where: { id: brandId } });
  const subCat = await SubCategories.findOne({ where: { id: subCategoryId } });
  if (!brand || !subCat) return next(new AppError("Not Found info"), 404);

  const subandbrand = await SubCategoriesAndBrands.create({
    subCategoryId,
    brandId,
  });
  return res.status(201).send(subandbrand);
});

exports.getAll = catchAsync(async (req, res, next) => {
  const brand = await Brands.findAll({
    include: [
      {
        model: BrandImgs,
        as: "brandImg",
      },
      {
        model: SubCategories,
        through: SubCategoriesAndBrands,
        as: "subCategory",
      },
      {
        model: Products,
        as: "products",
      },
    ],
  });
  if (!brand) return next(new AppError("No Brands yet!", 404));
  for (let i = 0; i < brand.length; i++) {
    if (brand[i].brandImg.length > 0) {
      brand[i].brandImg[0].brandId = `${req.protocol}://${req.get(
        "host"
      )}/images/brands/${brand[i].brandImg[0].uuid}.webp`;
    }
  }
  return res.status(201).send(brand);
});

exports.edit = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: [{ model: BrandImgs, as: "brandImg" }],
  });
  if (!brand) return next(new AppError("Not found", 404));
  let name = req.body.name || brand.name;

  await brand.update({ name });

  return res.status(201).send(brand);
});

exports.getOne = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: Products,
        as: "products",
      },
    ],
  });
  if (!brand) return next(new AppError("Not found!", 404));

  return res.status(201).send(brand);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: BrandImgs,
        as: "brandImg",
      },
      {
        model: SubCategories,
        through: SubCategoriesAndBrands,
        as: "subCategory",
      },
    ],
  });
  if (!brand) return next(new AppError("Not found!", 404));
  let rubbish = `images/brands/${brand.brandImg[0].uuid}.webp`;
  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Error deleteing this file ${rubbish}`);
    } else {
      console.log(`${rubbish} has been successfully  deleted ! `);
    }
  });
  const brandImg = await BrandImgs.findOne({
    where: { uuid: brand.brandImg[0].uuid },
  });
  if (brandImg) {
    await brandImg.destroy();
  }
  await brand.destroy();
  return res.status(201).send({ msg: "deleted" });
});

exports.editImg = catchAsync(async (req, res, next) => {
  const img = await Brands.findOne({
    where: { uuid: req.params.uuid },
    include: [
      {
        model: BrandImgs,
        as: "brandImg",
      },
    ],
  });

  if (!img) return next(new AppError("Not Found", 404));

  const rubbish = `images/brands/${img.brandImg[0].uuid}.webp`;

  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Not found picture ${rubbish}`);
    } else {
      console.log(`Picture successfully deleted ${rubbish} 💥`);
    }
  });

  let Imgg = req.file.buffer;
  const newImgName = `${img.brandImg[0].uuid}.webp`;
  await sharp(Imgg)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`images/brands/${newImgName}`);

  return res.status(200).json({ msg: "Photo Successfully uploaded" });
});

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

exports.addImg = catchAsync(async (req, res, next) => {
  const brand = await Brands.findOne({ where: { uuid: req.params.uuid } });
  if (!brand) return next(new AppError("Brand not found!", 404));

  const newBrandImg = await BrandImgs.create({ brandId: brand.id });
  let img = req.file.buffer;
  const newImgName = `${newBrandImg.uuid}.webp`;
  await sharp(img)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`images/brands/${newImgName}`);

  return res.status(200).json({ msg: "Photo Successfully uploaded" });
});
