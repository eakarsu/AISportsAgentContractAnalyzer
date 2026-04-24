const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');

const router = express.Router();

// GET /api/contracts - List all contracts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts.' });
  }
});

// GET /api/contracts/:id - Get single contract
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract.' });
  }
});

// POST /api/contracts - Create new contract
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, team, league, position, contract_value, annual_salary,
      contract_years, signing_bonus, guaranteed_money, status, start_date, end_date
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contracts (player_name, team, league, position, contract_value, annual_salary,
        contract_years, signing_bonus, guaranteed_money, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [player_name, team, league, position, contract_value, annual_salary,
        contract_years, signing_bonus || 0, guaranteed_money || 0, status || 'Active', start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract.' });
  }
});

// PUT /api/contracts/:id - Update contract
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, team, league, position, contract_value, annual_salary,
      contract_years, signing_bonus, guaranteed_money, status, start_date, end_date
    } = req.body;

    const result = await pool.query(
      `UPDATE contracts SET player_name=$1, team=$2, league=$3, position=$4, contract_value=$5,
        annual_salary=$6, contract_years=$7, signing_bonus=$8, guaranteed_money=$9, status=$10,
        start_date=$11, end_date=$12, updated_at=CURRENT_TIMESTAMP
       WHERE id=$13 RETURNING *`,
      [player_name, team, league, position, contract_value, annual_salary,
        contract_years, signing_bonus, guaranteed_money, status, start_date, end_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract.' });
  }
});

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contracts WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    res.json({ message: 'Contract deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract.' });
  }
});

// POST /api/contracts/ai-analyze - AI analysis
router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('contracts', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
