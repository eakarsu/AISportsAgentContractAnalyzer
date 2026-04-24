const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/league-rules
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM league_rules ORDER BY league, rule_category, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching league rules:', error);
    res.status(500).json({ error: 'Failed to fetch league rules.' });
  }
});

// GET /api/league-rules/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM league_rules WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League rule not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching league rule:', error);
    res.status(500).json({ error: 'Failed to fetch league rule.' });
  }
});

// POST /api/league-rules
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      league, rule_category, rule_name, description, salary_cap_amount,
      luxury_tax_threshold, roster_limit, min_salary, max_contract_years,
      free_agency_start, trade_deadline, season, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO league_rules (league, rule_category, rule_name, description, salary_cap_amount,
        luxury_tax_threshold, roster_limit, min_salary, max_contract_years,
        free_agency_start, trade_deadline, season, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [league, rule_category, rule_name, description, salary_cap_amount,
        luxury_tax_threshold, roster_limit, min_salary, max_contract_years,
        free_agency_start, trade_deadline, season, status || 'Current']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating league rule:', error);
    res.status(500).json({ error: 'Failed to create league rule.' });
  }
});

// PUT /api/league-rules/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      league, rule_category, rule_name, description, salary_cap_amount,
      luxury_tax_threshold, roster_limit, min_salary, max_contract_years,
      free_agency_start, trade_deadline, season, status
    } = req.body;

    const result = await pool.query(
      `UPDATE league_rules SET league=$1, rule_category=$2, rule_name=$3, description=$4,
        salary_cap_amount=$5, luxury_tax_threshold=$6, roster_limit=$7, min_salary=$8,
        max_contract_years=$9, free_agency_start=$10, trade_deadline=$11, season=$12,
        status=$13, updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [league, rule_category, rule_name, description, salary_cap_amount,
        luxury_tax_threshold, roster_limit, min_salary, max_contract_years,
        free_agency_start, trade_deadline, season, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League rule not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating league rule:', error);
    res.status(500).json({ error: 'Failed to update league rule.' });
  }
});

// DELETE /api/league-rules/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM league_rules WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League rule not found.' });
    }
    res.json({ message: 'League rule deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting league rule:', error);
    res.status(500).json({ error: 'Failed to delete league rule.' });
  }
});

module.exports = router;
