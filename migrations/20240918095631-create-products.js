'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('products');
  },
};
