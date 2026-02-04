const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        message: 'É necessário fornecer um token de autenticação'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ 
        error: 'Formato de token inválido',
        message: 'O token deve estar no formato: Bearer {token}'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        error: 'Token mal formatado',
        message: 'O token deve começar com Bearer'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.merchantId = decoded.id;
    req.merchantEmail = decoded.email;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Seu token de autenticação expirou. Faça login novamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'O token fornecido é inválido'
      });
    }

    logger.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Erro na autenticação',
      message: 'Ocorreu um erro ao validar o token'
    });
  }
};

module.exports = authMiddleware;
