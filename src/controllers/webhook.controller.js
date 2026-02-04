const pool = require('../config/database');
const logger = require('../config/logger');
const MercadoPagoService = require('../services/mercadopago.service');

class WebhookController {
  async handleMercadoPago(req, res) {
    const connection = await pool.getConnection();
    
    try {
      const { type, data } = req.body;

      logger.info('Webhook received from Mercado Pago', { type, data });

      await connection.query(
        `INSERT INTO webhooks_log (payment_id, event_type, payload, status) 
         VALUES (?, ?, ?, ?)`,
        [data?.id || null, type, JSON.stringify(req.body), 'received']
      );

      res.status(200).send('OK');

      if (type === 'payment' && data?.id) {
        await this.processPaymentWebhook(data.id, connection);
      }
    } catch (error) {
      logger.error('Webhook processing error:', error);
      
      try {
        await connection.query(
          `UPDATE webhooks_log 
           SET status = ?, error_message = ? 
           WHERE payment_id = ? 
           ORDER BY created_at DESC LIMIT 1`,
          ['failed', error.message, req.body.data?.id]
        );
      } catch (logError) {
        logger.error('Failed to log webhook error:', logError);
      }
      
      if (!res.headersSent) {
        res.status(200).send('OK');
      }
    } finally {
      connection.release();
    }
  }

  async processPaymentWebhook(paymentId, connection) {
    try {
      const [charges] = await connection.query(
        `SELECT c.id, c.merchant_id, m.mercadopago_access_token 
         FROM charges c
         JOIN merchants m ON c.merchant_id = m.id
         WHERE c.mercadopago_payment_id = ?`,
        [paymentId]
      );

      if (charges.length === 0) {
        logger.warn('Charge not found for payment', { paymentId });
        return;
      }

      const charge = charges[0];
      const mpAccessToken = charge.mercadopago_access_token || process.env.MERCADOPAGO_ACCESS_TOKEN;
      
      const mpService = new MercadoPagoService(mpAccessToken);
      const paymentResult = await mpService.getPayment(paymentId);

      if (!paymentResult.success) {
        logger.error('Failed to fetch payment details', { paymentId });
        return;
      }

      const payment = paymentResult.data;
      const newStatus = this.mapMercadoPagoStatus(payment.status);

      await connection.query(
        `UPDATE charges 
         SET status = ?, paid_at = ? 
         WHERE id = ?`,
        [
          newStatus,
          payment.status === 'approved' ? new Date() : null,
          charge.id
        ]
      );

      await connection.query(
        `UPDATE webhooks_log 
         SET status = ?, processed_at = NOW(), merchant_id = ? 
         WHERE payment_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        ['processed', charge.merchant_id, paymentId]
      );

      logger.info('Payment webhook processed successfully', { 
        chargeId: charge.id, 
        paymentId, 
        status: newStatus 
      });
    } catch (error) {
      logger.error('Error processing payment webhook:', error);
      throw error;
    }
  }

  mapMercadoPagoStatus(mpStatus) {
    const statusMap = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    };

    return statusMap[mpStatus] || 'pending';
  }
}

module.exports = new WebhookController();
