const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const logger = require('../config/logger');
const MercadoPagoService = require('../services/mercadopago.service');

class ChargeController {
  async create(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        amount,
        description,
        payer_cpf,
        payer_name,
        payer_email,
        external_reference
      } = req.body;

      const [merchants] = await connection.query(
        'SELECT mercadopago_access_token, fee_percentage FROM merchants WHERE id = ?',
        [req.merchantId]
      );

      if (merchants.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: 'Lojista não encontrado',
          message: 'Lojista não encontrado'
        });
      }

      const merchant = merchants[0];
      const mpAccessToken = merchant.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN;

      if (!mpAccessToken) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Token do Mercado Pago não configurado',
          message: 'Configure seu token do Mercado Pago no perfil'
        });
      }

      const chargeId = uuidv4();
      const feePercentage = parseFloat(merchant.fee_percentage);
      const feeAmount = (parseFloat(amount) * feePercentage) / 100;
      const netAmount = parseFloat(amount) - feeAmount;

      const webhookUrl = `${process.env.API_URL}/api/webhooks/mercadopago`;
      const idempotencyKey = uuidv4();

      const mpService = new MercadoPagoService(mpAccessToken);
      const paymentResult = await mpService.createPixPayment({
        amount,
        description: description || 'Pagamento via TomatePay',
        payer_cpf: payer_cpf.replace(/\D/g, ''),
        payer_name,
        payer_email,
        notification_url: webhookUrl,
        external_reference: external_reference || chargeId,
        idempotency_key: idempotencyKey
      });

      if (!paymentResult.success) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Erro ao criar cobrança',
          message: paymentResult.error,
          details: paymentResult.details
        });
      }

      await connection.query(
        `INSERT INTO charges 
         (id, merchant_id, external_reference, amount, description, payer_cpf, 
          payer_name, payer_email, mercadopago_payment_id, qr_code, qr_code_base64, 
          ticket_url, status, fee_amount, net_amount, expires_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chargeId,
          req.merchantId,
          external_reference || chargeId,
          amount,
          description,
          payer_cpf.replace(/\D/g, ''),
          payer_name,
          payer_email,
          paymentResult.payment_id,
          paymentResult.qr_code,
          paymentResult.qr_code_base64,
          paymentResult.ticket_url,
          'pending',
          feeAmount.toFixed(2),
          netAmount.toFixed(2),
          paymentResult.expires_at
        ]
      );

      await connection.commit();

      logger.info('Charge created successfully', { 
        chargeId, 
        merchantId: req.merchantId,
        paymentId: paymentResult.payment_id 
      });

      res.status(201).json({
        message: 'Cobrança criada com sucesso',
        data: {
          id: chargeId,
          amount: parseFloat(amount),
          fee_amount: feeAmount,
          net_amount: netAmount,
          status: 'pending',
          qr_code: paymentResult.qr_code,
          qr_code_base64: paymentResult.qr_code_base64,
          ticket_url: paymentResult.ticket_url,
          expires_at: paymentResult.expires_at,
          checkout_url: `${process.env.FRONTEND_URL}/checkout/${chargeId}`
        }
      });
    } catch (error) {
      await connection.rollback();
      logger.error('Create charge error:', error);
      res.status(500).json({
        error: 'Erro ao criar cobrança',
        message: 'Ocorreu um erro ao criar a cobrança'
      });
    } finally {
      connection.release();
    }
  }

  async list(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, external_reference, amount, description, payer_name, 
               status, fee_amount, net_amount, created_at, paid_at 
        FROM charges 
        WHERE merchant_id = ?
      `;
      const params = [req.merchantId];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [charges] = await pool.query(query, params);

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM charges WHERE merchant_id = ?' + 
        (status ? ' AND status = ?' : ''),
        status ? [req.merchantId, status] : [req.merchantId]
      );

      res.json({
        data: charges.map(charge => ({
          ...charge,
          amount: parseFloat(charge.amount),
          fee_amount: parseFloat(charge.fee_amount),
          net_amount: parseFloat(charge.net_amount)
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      logger.error('List charges error:', error);
      res.status(500).json({
        error: 'Erro ao listar cobranças',
        message: 'Ocorreu um erro ao listar as cobranças'
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const [charges] = await pool.query(
        `SELECT * FROM charges WHERE id = ? AND merchant_id = ?`,
        [id, req.merchantId]
      );

      if (charges.length === 0) {
        return res.status(404).json({
          error: 'Cobrança não encontrada',
          message: 'Cobrança não encontrada'
        });
      }

      const charge = charges[0];

      res.json({
        data: {
          ...charge,
          amount: parseFloat(charge.amount),
          fee_amount: parseFloat(charge.fee_amount),
          net_amount: parseFloat(charge.net_amount)
        }
      });
    } catch (error) {
      logger.error('Get charge error:', error);
      res.status(500).json({
        error: 'Erro ao buscar cobrança',
        message: 'Ocorreu um erro ao buscar a cobrança'
      });
    }
  }

  async getByIdPublic(req, res) {
    try {
      const { id } = req.params;

      const [charges] = await pool.query(
        `SELECT c.id, c.amount, c.description, c.status, c.qr_code, 
                c.qr_code_base64, c.ticket_url, c.expires_at, c.created_at,
                m.name as merchant_name
         FROM charges c
         JOIN merchants m ON c.merchant_id = m.id
         WHERE c.id = ?`,
        [id]
      );

      if (charges.length === 0) {
        return res.status(404).json({
          error: 'Cobrança não encontrada',
          message: 'Cobrança não encontrada'
        });
      }

      const charge = charges[0];

      res.json({
        data: {
          id: charge.id,
          amount: parseFloat(charge.amount),
          description: charge.description,
          status: charge.status,
          qr_code: charge.qr_code,
          qr_code_base64: charge.qr_code_base64,
          ticket_url: charge.ticket_url,
          expires_at: charge.expires_at,
          created_at: charge.created_at,
          merchant_name: charge.merchant_name
        }
      });
    } catch (error) {
      logger.error('Get public charge error:', error);
      res.status(500).json({
        error: 'Erro ao buscar cobrança',
        message: 'Ocorreu um erro ao buscar a cobrança'
      });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;

      const [charges] = await pool.query(
        'SELECT status FROM charges WHERE id = ? AND merchant_id = ?',
        [id, req.merchantId]
      );

      if (charges.length === 0) {
        return res.status(404).json({
          error: 'Cobrança não encontrada',
          message: 'Cobrança não encontrada'
        });
      }

      if (charges[0].status !== 'pending') {
        return res.status(400).json({
          error: 'Cobrança não pode ser cancelada',
          message: 'Apenas cobranças pendentes podem ser canceladas'
        });
      }

      await pool.query(
        'UPDATE charges SET status = ? WHERE id = ?',
        ['cancelled', id]
      );

      logger.info('Charge cancelled', { chargeId: id, merchantId: req.merchantId });

      res.json({
        message: 'Cobrança cancelada com sucesso'
      });
    } catch (error) {
      logger.error('Cancel charge error:', error);
      res.status(500).json({
        error: 'Erro ao cancelar cobrança',
        message: 'Ocorreu um erro ao cancelar a cobrança'
      });
    }
  }
}

module.exports = new ChargeController();
