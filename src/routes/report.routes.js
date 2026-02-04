const express = require('express');
const { query } = require('express-validator');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

router.get(
  '/dashboard',
  authMiddleware,
  reportController.getDashboard
);

router.get(
  '/transactions',
  authMiddleware,
  [
    query('start_date').optional().isDate(),
    query('end_date').optional().isDate(),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled', 'refunded'])
  ],
  validate,
  reportController.getTransactions
);

router.get(
  '/logs',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  reportController.getLogs
);

module.exports = router;
