const express = require('express');
const { body, query } = require('express-validator');
const chargeController = require('../controllers/charge.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
    body('description').optional().trim(),
    body('payer_cpf').matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF do pagador inválido'),
    body('payer_name').trim().notEmpty().withMessage('Nome do pagador é obrigatório'),
    body('payer_email').isEmail().withMessage('Email do pagador inválido'),
    body('external_reference').optional().trim()
  ],
  validate,
  auditLog('charge_create', 'charge'),
  chargeController.create
);

router.get(
  '/',
  authMiddleware,
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled', 'refunded']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  chargeController.list
);

router.get(
  '/:id',
  authMiddleware,
  chargeController.getById
);

router.post(
  '/:id/cancel',
  authMiddleware,
  auditLog('charge_cancel', 'charge'),
  chargeController.cancel
);

module.exports = router;
