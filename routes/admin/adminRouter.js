const express = require('express');

const {
  protect,
  login,
  updateAdmin,
} = require('./../../controllers/admin/authController');
const { addAdmin } = require('./../../controllers/admin/adminController');

const router = express.Router();
router.post('/add', addAdmin);
router.post('/login', login);
router.use(protect);
router.all('/update', updateAdmin);

router.use('/category', require('./categoryRouter'));

module.exports = router;
