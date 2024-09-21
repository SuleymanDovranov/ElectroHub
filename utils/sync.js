const { sequelize, Orders } = require('./../models');

(async () => {
  await Orders.sync({ alter: true });
  console.log('DB Synced');
  process.exit(1);
})();
