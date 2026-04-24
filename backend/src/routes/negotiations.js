const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');

const router = express.Router();

// GET /api/negotiations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM negotiations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    res.status(500).json({ error: 'Failed to fetch negotiations.' });
  }
});

// GET /api/negotiations/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Negotiation not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching negotiation:', error);
    res.status(500).json({ error: 'Failed to fetch negotiation.' });
  }
});

// POST /api/negotiations
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, team, agent_name, current_offer, asking_price,
      contract_years_offered, guaranteed_money_offered, status, priority,
      leverage_points, notes, deadline, round
    } = req.body;

    const result = await pool.query(
      `INSERT INTO negotiations (player_name, team, agent_name, current_offer, asking_price,
        contract_years_offered, guaranteed_money_offered, status, priority, leverage_points,
        notes, deadline, round)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [player_name, team, agent_name, current_offer, asking_price,
        contract_years_offered, guaranteed_money_offered, status || 'In Progress',
        priority || 'Medium', leverage_points, notes, deadline, round || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating negotiation:', error);
    res.status(500).json({ error: 'Failed to create negotiation.' });
  }
});

// PUT /api/negotiations/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, team, agent_name, current_offer, asking_price,
      contract_years_offered, guaranteed_money_offered, status, priority,
      leverage_points, notes, deadline, round
    } = req.body;

    const result = await pool.query(
      `UPDATE negotiations SET player_name=$1, team=$2, agent_name=$3, current_offer=$4,
        asking_price=$5, contract_years_offered=$6, guaranteed_money_offered=$7, status=$8,
        priority=$9, leverage_points=$10, notes=$11, deadline=$12, round=$13,
        updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [player_name, team, agent_name, current_offer, asking_price,
        contract_years_offered, guaranteed_money_offered, status, priority,
        leverage_points, notes, deadline, round, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Negotiation not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating negotiation:', error);
    res.status(500).json({ error: 'Failed to update negotiation.' });
  }
});

// DELETE /api/negotiations/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM negotiations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Negotiation not found.' });
    }

    res.json({ message: 'Negotiation deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting negotiation:', error);
    res.status(500).json({ error: 'Failed to delete negotiation.' });
  }
});

// POST /api/negotiations/ai-analyze
router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('negotiations', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
