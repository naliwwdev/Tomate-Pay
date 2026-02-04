const express = require('express');
const chargeController = require('../controllers/charge.controller');

const router = express.Router();

router.get(
  '/charges/:id',
  chargeController.getByIdPublic
);

module.exports = router;
