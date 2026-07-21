const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`actor:user:${user.id}`] },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password, name } = req.body;

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already in use.' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const verifyToken = crypto.randomBytes(32).toString('hex');

      const result = await pool.query(
        `INSERT INTO users (email, password, name, role, email_verify_token)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role`,
        [email, hashedPassword, name, 'viewer', verifyToken]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`actor:user:${user.id}`] },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '24h' }
      );

      res.status(201).json({ token, user });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3',
      [resetToken, expiry, email]
    );

    res.json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 12 }).withMessage('Password must be at least 12 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { token, password } = req.body;

      const result = await pool.query(
        'SELECT id FROM users WHERE reset_token=$1 AND reset_token_expiry > NOW()',
        [token]
      );

      if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired reset token.' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await pool.query(
        'UPDATE users SET password=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2',
        [hashedPassword, result.rows[0].id]
      );

      res.json({ message: 'Password reset successfully.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token is required.' });

    const result = await pool.query(
      'SELECT id FROM users WHERE email_verify_token=$1 AND email_verified=false',
      [token]
    );

    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid verification token.' });

    await pool.query(
      'UPDATE users SET email_verified=true, email_verify_token=NULL WHERE id=$1',
      [result.rows[0].id]
    );

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password',
  authenticateToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 12 }).withMessage('New password must be at least 12 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { current_password, new_password } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });

      const validPassword = await bcrypt.compare(current_password, result.rows[0].password);
      if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect.' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashedPassword, req.user.id]);

      res.json({ message: 'Password changed successfully.' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
