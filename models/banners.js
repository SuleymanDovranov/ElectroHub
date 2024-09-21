'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Banners extends Model {
    static associate(models) {}
  }
  Banners.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      img: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
      },
      link: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'banners',
      modelName: 'Banners',
    }
  );
  return Banners;
};
