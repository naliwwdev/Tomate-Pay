const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = require('./config/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const apiLogger = require('./middleware/apiLogger');

const authRoutes = require('./routes/auth.routes');
const chargeRoutes = require('./routes/charge.routes');
const webhookRoutes = require('./routes/webhook.routes');
const reportRoutes = require('./routes/report.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(path.join(__dirname, '../logs'))) {
  fs.mkdirSync(path.join(__dirname, '../logs'), { recursive: true });
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(apiLogger);

app.get('/', (req, res) => {
  res.json({
    name: 'TomatePay API',
    version: '1.0.0',
    description: 'Plataforma Intermediadora de Pagamentos',
    provider: 'Pagamentos processados via Mercado Pago',
    documentation: '/api/docs'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/charges', apiLimiter, chargeRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reports', apiLimiter, reportRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/docs', (req, res) => {
  res.json({
    title: 'TomatePay API Documentation',
    version: '1.0.0',
    provider: 'Pagamentos processados via Mercado Pago',
    baseUrl: process.env.API_URL || `http://localhost:${PORT}`,
    endpoints: {
      auth: {
        register: {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Registrar novo lojista',
          body: {
            name: 'string (required)',
            email: 'string (required)',
            cpf: 'string (required)',
            password: 'string (required, min 6 chars)'
          }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Fazer login',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          }
        },
        profile: {
          method: 'GET',
          path: '/api/auth/profile',
          description: 'Obter perfil do lojista',
          headers: {
            Authorization: 'Bearer {token}'
          }
        },
        updateProfile: {
          method: 'PUT',
          path: '/api/auth/profile',
          description: 'Atualizar perfil',
          headers: {
            Authorization: 'Bearer {token}'
          },
          body: {
            name: 'string (optional)',
            mercadopago_access_token: 'string (optional)'
          }
        }
      },
      charges: {
        create: {
          method: 'POST',
          path: '/api/charges',
          description: 'Criar nova cobrança PIX',
          headers: {
            Authorization: 'Bearer {token}'
          },
          body: {
            amount: 'number (required)',
            description: 'string (optional)',
            payer_cpf: 'string (required)',
            payer_name: 'string (required)',
            payer_email: 'string (required)',
            external_reference: 'string (optional)'
          }
        },
        list: {
          method: 'GET',
          path: '/api/charges',
          description: 'Listar cobranças',
          headers: {
            Authorization: 'Bearer {token}'
          },
          query: {
            status: 'string (optional)',
            page: 'number (optional, default: 1)',
            limit: 'number (optional, default: 20)'
          }
        },
        getById: {
          method: 'GET',
          path: '/api/charges/:id',
          description: 'Obter cobrança por ID',
          headers: {
            Authorization: 'Bearer {token}'
          }
        },
        cancel: {
          method: 'POST',
          path: '/api/charges/:id/cancel',
          description: 'Cancelar cobrança pendente',
          headers: {
            Authorization: 'Bearer {token}'
          }
        }
      },
      reports: {
        dashboard: {
          method: 'GET',
          path: '/api/reports/dashboard',
          description: 'Obter dados do dashboard',
          headers: {
            Authorization: 'Bearer {token}'
          }
        },
        transactions: {
          method: 'GET',
          path: '/api/reports/transactions',
          description: 'Relatório de transações',
          headers: {
            Authorization: 'Bearer {token}'
          },
          query: {
            start_date: 'date (optional)',
            end_date: 'date (optional)',
            status: 'string (optional)'
          }
        },
        logs: {
          method: 'GET',
          path: '/api/reports/logs',
          description: 'Logs de API',
          headers: {
            Authorization: 'Bearer {token}'
          }
        }
      },
      public: {
        getCharge: {
          method: 'GET',
          path: '/api/public/charges/:id',
          description: 'Obter cobrança pública (para checkout)'
        }
      }
    },
    legal: {
      provider: 'Mercado Pago',
      disclaimer: 'Pagamentos processados via Mercado Pago. TomatePay atua como intermediador de pagamentos.'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: 'O endpoint solicitado não existe'
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ocorreu um erro inesperado' 
      : err.message
  });
});

app.listen(PORT, () => {
  logger.info(`TomatePay API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Provider: Mercado Pago`);
  console.log(`\n🍅 TomatePay API is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💳 Provider: Mercado Pago\n`);
});

module.exports = app;
