const express = require('express');

const {
  add,
  getAll,
  uploadPhoto,
  getOne,
  edit,
  deleteOne,
} = require('./../../controllers/admin/categoryController');

const router = express.Router();

router.post('/add', uploadPhoto, add);
router.get('/getAll', getAll);
router.get('/getOne/:uuid', getOne);
router.patch('/edit/:uuid', uploadPhoto, edit);
router.delete('/delete/:uuid', deleteOne);

module.exports = router;
