const axios = require('axios');
const logger = require('../config/logger');

class MercadoPagoService {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    this.baseURL = 'https://api.mercadopago.com';
  }

  async createPixPayment(data) {
    try {
      const payload = {
        transaction_amount: parseFloat(data.amount),
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payer_email,
          first_name: data.payer_name,
          identification: {
            type: 'CPF',
            number: data.payer_cpf.replace(/\D/g, '')
          }
        },
        notification_url: data.notification_url,
        external_reference: data.external_reference
      };

      logger.info('Creating PIX payment on Mercado Pago', { 
        amount: payload.transaction_amount,
        external_reference: payload.external_reference 
      });

      const response = await axios.post(
        `${this.baseURL}/v1/payments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': data.idempotency_key
          }
        }
      );

      logger.info('PIX payment created successfully', { 
        payment_id: response.data.id 
      });

      return {
        success: true,
        payment_id: response.data.id,
        status: response.data.status,
        qr_code: response.data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.data.point_of_interaction?.transaction_data?.ticket_url,
        expires_at: response.data.date_of_expiration
      };
    } catch (error) {
      logger.error('Mercado Pago API error:', {
        message: error.message,
        response: error.response?.data
      });

      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar pagamento PIX',
        details: error.response?.data
      };
    }
  }

  async getPayment(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Error fetching payment:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar pagamento'
      };
    }
  }

  async refundPayment(paymentId, amount = null) {
    try {
      const payload = amount ? { amount: parseFloat(amount) } : {};

      const response = await axios.post(
        `${this.baseURL}/v1/payments/${paymentId}/refunds`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Payment refunded successfully', { payment_id: paymentId });

      return {
        success: true,
        refund_id: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Error refunding payment:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao estornar pagamento'
      };
    }
  }
}

module.exports = MercadoPagoService;
