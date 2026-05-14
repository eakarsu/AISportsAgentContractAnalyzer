const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/financials
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM financials');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM financials ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching financials:', error);
    res.status(500).json({ error: 'Failed to fetch financials.' });
  }
});

// GET /api/financials/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM financials WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Financial record not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching financial record:', error);
    res.status(500).json({ error: 'Failed to fetch financial record.' });
  }
});

// POST /api/financials
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      transaction_type, description, player_name, deal_name, amount,
      commission_earned, expense_category, payment_status, payment_date,
      due_date, notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO financials (transaction_type, description, player_name, deal_name, amount,
        commission_earned, expense_category, payment_status, payment_date, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [transaction_type, description, player_name, deal_name, amount,
        commission_earned || 0, expense_category, payment_status || 'Pending',
        payment_date, due_date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating financial record:', error);
    res.status(500).json({ error: 'Failed to create financial record.' });
  }
});

// PUT /api/financials/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transaction_type, description, player_name, deal_name, amount,
      commission_earned, expense_category, payment_status, payment_date,
      due_date, notes
    } = req.body;

    const result = await pool.query(
      `UPDATE financials SET transaction_type=$1, description=$2, player_name=$3,
        deal_name=$4, amount=$5, commission_earned=$6, expense_category=$7,
        payment_status=$8, payment_date=$9, due_date=$10, notes=$11,
        updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [transaction_type, description, player_name, deal_name, amount,
        commission_earned, expense_category, payment_status, payment_date,
        due_date, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Financial record not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating financial record:', error);
    res.status(500).json({ error: 'Failed to update financial record.' });
  }
});

// DELETE /api/financials/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM financials WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Financial record not found.' });
    }
    res.json({ message: 'Financial record deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting financial record:', error);
    res.status(500).json({ error: 'Failed to delete financial record.' });
  }
});

module.exports = router;
