const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const logger = require('../config/logger');

class AuthController {
  async register(req, res) {
    const connection = await pool.getConnection();
    
    try {
      const { name, email, cpf, password } = req.body;

      const [existingMerchant] = await connection.query(
        'SELECT id FROM merchants WHERE email = ? OR cpf = ?',
        [email, cpf.replace(/\D/g, '')]
      );

      if (existingMerchant.length > 0) {
        return res.status(400).json({
          error: 'Lojista já cadastrado',
          message: 'Email ou CPF já está em uso'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const merchantId = uuidv4();

      await connection.query(
        `INSERT INTO merchants (id, name, email, cpf, password_hash) 
         VALUES (?, ?, ?, ?, ?)`,
        [merchantId, name, email, cpf.replace(/\D/g, ''), passwordHash]
      );

      logger.info('New merchant registered', { merchantId, email });

      const token = jwt.sign(
        { id: merchantId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(201).json({
        message: 'Lojista cadastrado com sucesso',
        data: {
          id: merchantId,
          name,
          email,
          token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        error: 'Erro no cadastro',
        message: 'Ocorreu um erro ao cadastrar o lojista'
      });
    } finally {
      connection.release();
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const [merchants] = await pool.query(
        'SELECT id, name, email, password_hash, status FROM merchants WHERE email = ?',
        [email]
      );

      if (merchants.length === 0) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      const merchant = merchants[0];

      if (merchant.status !== 'active') {
        return res.status(403).json({
          error: 'Conta inativa',
          message: 'Sua conta está inativa ou suspensa. Entre em contato com o suporte.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, merchant.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      }

      const token = jwt.sign(
        { id: merchant.id, email: merchant.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info('Merchant logged in', { merchantId: merchant.id, email });

      res.json({
        message: 'Login realizado com sucesso',
        data: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        error: 'Erro no login',
        message: 'Ocorreu um erro ao fazer login'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const [merchants] = await pool.query(
        `SELECT id, name, email, cpf, fee_percentage, status, created_at 
         FROM merchants WHERE id = ?`,
        [req.merchantId]
      );

      if (merchants.length === 0) {
        return res.status(404).json({
          error: 'Lojista não encontrado',
          message: 'Perfil não encontrado'
        });
      }

      const merchant = merchants[0];

      res.json({
        data: {
          id: merchant.id,
          name: merchant.name,
          email: merchant.email,
          cpf: merchant.cpf,
          fee_percentage: parseFloat(merchant.fee_percentage),
          status: merchant.status,
          created_at: merchant.created_at
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        error: 'Erro ao buscar perfil',
        message: 'Ocorreu um erro ao buscar o perfil'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, mercadopago_access_token } = req.body;
      const updates = [];
      const values = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }

      if (mercadopago_access_token) {
        updates.push('mercadopago_access_token = ?');
        values.push(mercadopago_access_token);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: 'Nenhum dado para atualizar',
          message: 'Forneça ao menos um campo para atualizar'
        });
      }

      values.push(req.merchantId);

      await pool.query(
        `UPDATE merchants SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      logger.info('Merchant profile updated', { merchantId: req.merchantId });

      res.json({
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        error: 'Erro ao atualizar perfil',
        message: 'Ocorreu um erro ao atualizar o perfil'
      });
    }
  }
}

module.exports = new AuthController();
