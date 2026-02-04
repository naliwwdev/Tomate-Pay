const express = require('express');
const webhookController = require('../controllers/webhook.controller');
const { webhookLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/mercadopago',
  webhookLimiter,
  webhookController.handleMercadoPago
);

module.exports = router;
