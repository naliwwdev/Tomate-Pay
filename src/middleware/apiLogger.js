const pool = require('../config/database');
const logger = require('../config/logger');

const apiLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  const originalJson = res.json.bind(res);
  let responseBody;
  
  res.json = function(data) {
    responseBody = data;
    return originalJson(data);
  };

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const merchantId = req.merchantId || null;
    const endpoint = req.originalUrl || req.url;
    const method = req.method;
    const statusCode = res.statusCode;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    const requestBody = JSON.stringify(req.body);
    const responseBodyStr = JSON.stringify(responseBody);

    try {
      await pool.query(
        `INSERT INTO api_logs 
         (merchant_id, endpoint, method, status_code, ip_address, user_agent, 
          request_body, response_body, duration_ms) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [merchantId, endpoint, method, statusCode, ipAddress, userAgent, 
         requestBody, responseBodyStr, duration]
      );
    } catch (error) {
      logger.error('Failed to log API request:', error);
    }
  });

  next();
};

module.exports = apiLogger;
