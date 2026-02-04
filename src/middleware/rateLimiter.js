const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Muitas requisições',
    message: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de login',
    message: 'Você excedeu o limite de tentativas de login. Tente novamente em 15 minutos.'
  }
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    error: 'Muitas requisições de webhook',
    message: 'Limite de webhooks excedido'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  webhookLimiter
};
