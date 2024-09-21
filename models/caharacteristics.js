'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Caharacteristics extends Model {
    static associate(models) {}
  }
  Caharacteristics.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      type: {
        type: DataTypes.STRING,
      },
      value: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'caharacteristics',
      modelName: 'Caharacteristics',
    }
  );
  return Caharacteristics;
};
