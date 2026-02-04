const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('cpf').matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('CPF inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  validate,
  auditLog('merchant_register', 'merchant'),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  validate,
  authController.login
);

router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
    body('mercadopago_access_token').optional().trim().notEmpty()
  ],
  validate,
  auditLog('profile_update', 'merchant'),
  authController.updateProfile
);

module.exports = router;
