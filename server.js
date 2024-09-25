const app = require('./app');

const { sequelize } = require('./models');

app.listen({ port: 5000 }, async () => {
  console.log('server up 5000');
  await sequelize.authenticate();
  console.log('database connected');
  console.log('1️⃣ For Admin /admin/***');
  console.log('2️⃣ For Guest /guest/***');
});
