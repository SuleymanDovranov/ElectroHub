const {
  Products,
  Categories,
  ProductsAndCategories,
  SubCategories,
  Brands,
  ProductImgs,
} = require("./../../models");
const AppError = require("./../../utils/appError");
const catchAsync = require("./../../utils/catchAsync");
const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const { search_body } = require("./../../utils/search_body");
const { Op } = require("sequelize");
const products = require("../../models/products");

exports.getAll = catchAsync(async (req, res, next) => {
  var {
    code,
    keyword,
    color,
    price,
    oldPrice,
    discount,
    neww,
    priceFrom,
    priceTo,
    brandId,
    subCategoryId,
    name,
  } = req.query;

  let where = {};

  if (name) where.name = name;
  if (keyword) where = search_body(keyword);
  if (brandId) where.brandId = brandId;
  if (subCategoryId) where.subCategoryId = subCategoryId;
  if (code) where.code = code;
  if (color) where.color = color;
  if (price) where.price = price;
  if (oldPrice) where.oldPrice = oldPrice;
  if (discount) where.discount = discount;
  if (neww) where.neww = neww;
  if (priceFrom && priceTo) {
    where.price = { [Op.between]: [priceFrom, priceTo] };
  }

  const products = await Products.findAll({
    where,
    include: [
      {
        model: Categories,
        through: ProductsAndCategories,
        as: "categories",
      },
      {
        model: Brands,
        as: "brands",
      },
      {
        model: SubCategories,
        as: "subs",
      },
      {
        model: ProductImgs,
        as: "product_images",
      },
    ],
  });
  if (!products) return next(new AppError("Not products", 404));

  for (let i = 0; i < products.length; i++) {
    if (products[i].product_images.length > 0) {
      products[i].product_images[0].productId = `${req.protocol}://${req.get(
        "host"
      )}/images/products/${products[i].product_images[0].uuid}.webp`;
    }
  }

  return res.status(201).send(products);
});

exports.add = catchAsync(async (req, res, next) => {
  var {
    name,
    code,
    color,
    oldPrice,
    price,
    rating,
    variantsCount,
    discount,
    neww,
    description,
    categoryId,
    subCategoryId,
    brandId,
  } = req.body;

  if (subCategoryId) {
    const subCat = await SubCategories.findOne({
      where: { id: subCategoryId },
    });
    if (!subCat) return next(new AppError("SubCategory not found!", 404));
  }
  if (categoryId) {
    const cat = await Categories.findOne({ where: { id: categoryId } });
    if (!cat) return next(new AppError("Category not found!", 404));
  }
  if (brandId) {
    const brand = await Brands.findOne({ where: { id: brandId } });
    if (!brand) return next(new AppError("Brand not found!", 404));
  }
  const product = await Products.create({
    name,
    code,
    color,
    oldPrice,
    price,
    rating,
    variantsCount,
    discount,
    neww,
    description,
    categoryId,
    subCategoryId,
    brandId,
  });

  if (req.body.categories) {
    for (categoryId of req.body.categories) {
      const cat = await Categories.findOne({ where: { id: categoryId } });
      if (!cat) return next(new AppError("Categories list not found", 404));
      await ProductsAndCategories.create({
        category_id: categoryId,
        product_id: product.id,
      });
    }
  }
  return res.status(201).send(product);
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  const allProducts = await Products.findAll({
    include: [
      {
        model: Productimg,
        as: "product_images",
      },
    ],
  });

  if (!allProducts)
    return next(new AppError("No Products there to delete!", 404));

  allProducts.forEach(function (n) {
    if (n.product_images.length > 0) {
      let imgPath = `./images/products/${n.product_images[0].uuid}.webp`;
      fs.unlink(imgPath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${imgPath}`, err);
        } else {
          console.log(`Image file ${imgPath} deleted successfully`);
        }
      });
    }
  });

  await Products.destroy({ where: {} });
  await Productimg.destroy({ where: {} });

  return res.status(200).send({ msg: "Successfully deleted All Products ✅" });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  let uuid = req.body.uuid;
  const product = await Products.findOne({ where: { uuid: uuid } });

  if (!product) return next(new AppError("Not found!", 404));

  let rubbish = `images/product/${product.img}`;

  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Can't delete this file ${rubbish}`);
    } else {
      console.log(`Succcessfully deleted ${rubbish} 💥`);
    }
  });

  await product.destroy();

  return res.status(201).send({ msg: "Successfully deleted ✅" });
});

exports.edit = catchAsync(async (req, res, next) => {
  const product = await Products.finOne({ where: { uuid: req.params.uuid } });
  if (!product) return next(new AppError("Not Found", 404));

  let name = req.body.name || products.name;
  let code = req.body.code || products.code;
  let color = req.body.color || products.color;
  let oldPrice = req.body.oldPrice || products.oldPrice;
  let price = req.body.price || products.price;
  let rating = req.body.rating || products.rating;
  let variantsCount = req.body.variantsCount || products.variantsCount;
  let discount = req.body.discount || products.discount;
  let neww = req.body.neww || products.neww;
  let description = req.body.description || products.description;
  let categoryId = req.body.categoryId || products.categoryId;
  let subCategoryId = req.body.subCategoryId || products.subCategoryId;
  let brandId = req.body.brandId || products.brandId;
});

exports.editImg = catchAsync(async (req, res, next) => {
  const img = await ProductImgs.findOne({
    where: { uuid: req.params.uuid },
  });

  if (!img) return next(new AppError("Not Found", 404));

  const rubbish = `images/products/${img.uuid}.webp`;

  fs.unlink(rubbish, (err) => {
    if (err) {
      console.log(`Not found picture ${rubbish}`);
    } else {
      console.log(`Picture successfully deleted ${rubbish} 💥`);
    }
  });

  let Imgg = req.file.buffer;
  const newImgName = `${img.uuid}.webp`;
  await sharp(Imgg)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`images/products/${newImgName}`);

  return res.status(200).json({ msg: "Photo Successfully uploaded" });
});

exports.editCatAndPro = catchAsync(async (req, res, next) => {
  const cat = await ProductsAndCategories.findOne({
    where: { product_id: req.params.id },
  });
  if (!cat) return next(new AppError("Not found!", 404));
  let category_id = req.body.categoryId || cat.category_id;
  let product_id = req.body.productId || cat.product_id;
  await cat.update({
    category_id: category_id,
    product_id: product_id,
  });
  return res.status(201).send({ msg: "Edited" });
});

// exports.deleteCatAndPro = catchAsync(async(req, res, next) => {
//   const cat = await ProductsAndCategories.findOne({
//     where: {category_id: req.params.id}
//   })

// })

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
  const product = await Products.findOne({ where: { uuid: req.params.uuid } });
  if (!product) return next(new AppError("Product not found!", 404));

  const newProductImg = await ProductImgs.create({ productId: product.id });
  let img = req.file.buffer;
  const newImgName = `${newProductImg.uuid}.webp`;
  await sharp(img)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`images/products/${newImgName}`);

  return res.status(200).json({ msg: "Photo Successfully uploaded" });
});
