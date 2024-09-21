'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate(models) {}
  }
  Products.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      color: {
        type: DataTypes.STRING,
      },
      img: {
        type: DataTypes.STRING,
      },
      oldPrice: {
        type: DataTypes.REAL,
      },
      price: {
        type: DataTypes.REAL,
      },
      rating: {
        type: DataTypes.REAL,
      },
      variantsCount: {
        type: DataTypes.INTEGER,
      },
      discount: {
        type: DataTypes.REAL,
      },
      new: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      tableName: 'products',
      modelName: 'Products',
    }
  );
  return Products;
};
