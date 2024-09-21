const { Op } = require('sequelize');

const capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.search_body = (keyword) => {
  let keywords = [
    `%${keyword}%`,
    `%${keyword.toLowerCase()}%`,
    `%${capitalize(keyword.toLowerCase())}%`,
  ];

  return {
    [Op.or]: [
      {
        name_tm: {
          [Op.like]: {
            [Op.any]: keywords,
          },
        },
      },
      {
        name_ru: {
          [Op.like]: {
            [Op.any]: keywords,
          },
        },
      },
      {
        name_en: {
          [Op.like]: {
            [Op.any]: keywords,
          },
        },
      },
    ],
  };
};
