'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeedBacks extends Model {
    static associate(models) {}
  }
  FeedBacks.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      buyerRating: {
        type: DataTypes.REAL,
      },
      buyerComment: {
        type: DataTypes.TEXT,
      },
      date: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: 'feedbacks',
      modelName: 'FeedBacks',
    }
  );
  return FeedBacks;
};
