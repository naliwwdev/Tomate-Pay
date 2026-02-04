const pool = require('../config/database');
const logger = require('../config/logger');

class ReportController {
  async getDashboard(req, res) {
    try {
      const merchantId = req.merchantId;

      const [totalCharges] = await pool.query(
        'SELECT COUNT(*) as total FROM charges WHERE merchant_id = ?',
        [merchantId]
      );

      const [approvedCharges] = await pool.query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount, SUM(net_amount) as net_amount 
         FROM charges WHERE merchant_id = ? AND status = 'approved'`,
        [merchantId]
      );

      const [pendingCharges] = await pool.query(
        'SELECT COUNT(*) as total FROM charges WHERE merchant_id = ? AND status = "pending"',
        [merchantId]
      );

      const [todayCharges] = await pool.query(
        `SELECT COUNT(*) as total, SUM(amount) as total_amount 
         FROM charges 
         WHERE merchant_id = ? AND DATE(created_at) = CURDATE()`,
        [merchantId]
      );

      const [monthlyRevenue] = await pool.query(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           COUNT(*) as total_charges,
           SUM(amount) as total_amount,
           SUM(net_amount) as net_amount,
           SUM(fee_amount) as total_fees
         FROM charges 
         WHERE merchant_id = ? AND status = 'approved'
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC
         LIMIT 12`,
        [merchantId]
      );

      const [recentCharges] = await pool.query(
        `SELECT id, external_reference, amount, status, created_at 
         FROM charges 
         WHERE merchant_id = ? 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [merchantId]
      );

      res.json({
        data: {
          summary: {
            total_charges: totalCharges[0].total,
            approved_charges: approvedCharges[0].total || 0,
            pending_charges: pendingCharges[0].total || 0,
            total_revenue: parseFloat(approvedCharges[0].total_amount || 0),
            net_revenue: parseFloat(approvedCharges[0].net_amount || 0),
            today_charges: todayCharges[0].total || 0,
            today_amount: parseFloat(todayCharges[0].total_amount || 0)
          },
          monthly_revenue: monthlyRevenue.map(row => ({
            month: row.month,
            total_charges: row.total_charges,
            total_amount: parseFloat(row.total_amount),
            net_amount: parseFloat(row.net_amount),
            total_fees: parseFloat(row.total_fees)
          })),
          recent_charges: recentCharges.map(charge => ({
            ...charge,
            amount: parseFloat(charge.amount)
          }))
        }
      });
    } catch (error) {
      logger.error('Dashboard report error:', error);
      res.status(500).json({
        error: 'Erro ao gerar relatório',
        message: 'Ocorreu um erro ao gerar o relatório do dashboard'
      });
    }
  }

  async getTransactions(req, res) {
    try {
      const { start_date, end_date, status } = req.query;
      
      let query = `
        SELECT 
          id, external_reference, amount, description, payer_name, 
          status, fee_amount, net_amount, created_at, paid_at
        FROM charges 
        WHERE merchant_id = ?
      `;
      const params = [req.merchantId];

      if (start_date) {
        query += ' AND DATE(created_at) >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND DATE(created_at) <= ?';
        params.push(end_date);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const [transactions] = await pool.query(query, params);

      const summary = transactions.reduce((acc, t) => {
        acc.total_amount += parseFloat(t.amount);
        acc.total_fees += parseFloat(t.fee_amount || 0);
        acc.net_amount += parseFloat(t.net_amount || 0);
        return acc;
      }, { total_amount: 0, total_fees: 0, net_amount: 0 });

      res.json({
        data: {
          transactions: transactions.map(t => ({
            ...t,
            amount: parseFloat(t.amount),
            fee_amount: parseFloat(t.fee_amount || 0),
            net_amount: parseFloat(t.net_amount || 0)
          })),
          summary
        }
      });
    } catch (error) {
      logger.error('Transactions report error:', error);
      res.status(500).json({
        error: 'Erro ao gerar relatório',
        message: 'Ocorreu um erro ao gerar o relatório de transações'
      });
    }
  }

  async getLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const [logs] = await pool.query(
        `SELECT endpoint, method, status_code, duration_ms, created_at 
         FROM api_logs 
         WHERE merchant_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [req.merchantId, parseInt(limit), parseInt(offset)]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM api_logs WHERE merchant_id = ?',
        [req.merchantId]
      );

      res.json({
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      logger.error('Logs report error:', error);
      res.status(500).json({
        error: 'Erro ao buscar logs',
        message: 'Ocorreu um erro ao buscar os logs'
      });
    }
  }
}

module.exports = new ReportController();
