'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductImgs extends Model {
    static associate(models) {}
  }
  ProductImgs.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      tableName: 'productimgs',
      modelName: 'ProductImgs',
    }
  );
  return ProductImgs;
};
