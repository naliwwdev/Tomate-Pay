const pool = require('../../config/database');
const logger = require('../../config/logger');

async function runMigrations() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    logger.info('Starting database migrations...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        mercadopago_access_token TEXT,
        fee_percentage DECIMAL(5,2) DEFAULT 2.50,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_cpf (cpf),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✓ Table merchants created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS charges (
        id VARCHAR(36) PRIMARY KEY,
        merchant_id VARCHAR(36) NOT NULL,
        external_reference VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        payer_cpf VARCHAR(14) NOT NULL,
        payer_name VARCHAR(255),
        payer_email VARCHAR(255),
        mercadopago_payment_id VARCHAR(255),
        qr_code TEXT,
        qr_code_base64 TEXT,
        ticket_url TEXT,
        status ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded') DEFAULT 'pending',
        fee_amount DECIMAL(10,2),
        net_amount DECIMAL(10,2),
        paid_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
        INDEX idx_merchant (merchant_id),
        INDEX idx_status (status),
        INDEX idx_mercadopago_payment_id (mercadopago_payment_id),
        INDEX idx_external_reference (external_reference),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✓ Table charges created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS webhooks_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(36),
        payment_id VARCHAR(255),
        event_type VARCHAR(100),
        payload TEXT,
        status ENUM('received', 'processed', 'failed') DEFAULT 'received',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL,
        INDEX idx_payment_id (payment_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✓ Table webhooks_log created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(36),
        endpoint VARCHAR(255),
        method VARCHAR(10),
        status_code INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_body TEXT,
        response_body TEXT,
        duration_ms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL,
        INDEX idx_merchant (merchant_id),
        INDEX idx_endpoint (endpoint),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✓ Table api_logs created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(36),
        old_values TEXT,
        new_values TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL,
        INDEX idx_merchant (merchant_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✓ Table audit_logs created');

    logger.info('All migrations completed successfully!');
    
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
