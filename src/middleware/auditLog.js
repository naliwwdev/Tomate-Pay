const pool = require('../config/database');
const logger = require('../config/logger');

const auditLog = (action, entityType = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit(req, action, entityType, data).catch(err => {
          logger.error('Audit log error:', err);
        });
      }
      return originalJson(data);
    };
    
    next();
  };
};

async function logAudit(req, action, entityType, responseData) {
  try {
    const merchantId = req.merchantId || null;
    const entityId = responseData?.id || responseData?.data?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    const newValues = JSON.stringify({
      body: req.body,
      params: req.params,
      query: req.query
    });

    await pool.query(
      `INSERT INTO audit_logs 
       (merchant_id, action, entity_type, entity_id, new_values, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [merchantId, action, entityType, entityId, newValues, ipAddress, userAgent]
    );
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
}

module.exports = auditLog;
