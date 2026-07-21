const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    if ((JWT_SECRET || '').length < 32) return res.status(503).json({ error: 'Secure authentication is not configured' });
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded.tenantId || !decoded.role || !decoded.subjectIds) throw new Error('missing authorization context');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { authenticateToken, JWT_SECRET };
