'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Histories extends Model {
    static associate(models) {}
  }
  Histories.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      preview: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
      },
      source: {
        type: DataTypes.STRING,
      },
      destinationType: {
        type: DataTypes.STRING,
      },
      destinationSource: {
        type: DataTypes.STRING,
      },
      actionText: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'histories',
      modelName: 'Histories',
    }
  );
  return Histories;
};
