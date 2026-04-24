const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');

const router = express.Router();

// GET /api/salary_caps
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM salary_caps ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching salary caps:', error);
    res.status(500).json({ error: 'Failed to fetch salary caps.' });
  }
});

// GET /api/salary_caps/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM salary_caps WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary cap record not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching salary cap:', error);
    res.status(500).json({ error: 'Failed to fetch salary cap.' });
  }
});

// POST /api/salary_caps
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      team, league, total_cap, current_spending, cap_space, dead_money,
      num_players, top_paid_player, top_salary, cap_utilization, season
    } = req.body;

    const result = await pool.query(
      `INSERT INTO salary_caps (team, league, total_cap, current_spending, cap_space, dead_money,
        num_players, top_paid_player, top_salary, cap_utilization, season)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [team, league, total_cap, current_spending, cap_space, dead_money || 0,
        num_players, top_paid_player, top_salary, cap_utilization, season]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating salary cap:', error);
    res.status(500).json({ error: 'Failed to create salary cap record.' });
  }
});

// PUT /api/salary_caps/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      team, league, total_cap, current_spending, cap_space, dead_money,
      num_players, top_paid_player, top_salary, cap_utilization, season
    } = req.body;

    const result = await pool.query(
      `UPDATE salary_caps SET team=$1, league=$2, total_cap=$3, current_spending=$4, cap_space=$5,
        dead_money=$6, num_players=$7, top_paid_player=$8, top_salary=$9, cap_utilization=$10,
        season=$11, updated_at=CURRENT_TIMESTAMP
       WHERE id=$12 RETURNING *`,
      [team, league, total_cap, current_spending, cap_space, dead_money,
        num_players, top_paid_player, top_salary, cap_utilization, season, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary cap record not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating salary cap:', error);
    res.status(500).json({ error: 'Failed to update salary cap record.' });
  }
});

// DELETE /api/salary_caps/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM salary_caps WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salary cap record not found.' });
    }

    res.json({ message: 'Salary cap record deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting salary cap:', error);
    res.status(500).json({ error: 'Failed to delete salary cap record.' });
  }
});

// POST /api/salary_caps/ai-analyze
router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('salary_caps', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
