const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');

const router = express.Router();

// GET /api/endorsements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM endorsements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch endorsements.' });
  }
});

// GET /api/endorsements/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM endorsements WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Endorsement not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching endorsement:', error);
    res.status(500).json({ error: 'Failed to fetch endorsement.' });
  }
});

// POST /api/endorsements
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, brand, deal_type, deal_value, duration_years, sport,
      social_media_followers, market_reach, status, category, start_date, end_date
    } = req.body;

    const result = await pool.query(
      `INSERT INTO endorsements (player_name, brand, deal_type, deal_value, duration_years, sport,
        social_media_followers, market_reach, status, category, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [player_name, brand, deal_type, deal_value, duration_years, sport,
        social_media_followers, market_reach, status || 'Active', category, start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating endorsement:', error);
    res.status(500).json({ error: 'Failed to create endorsement.' });
  }
});

// PUT /api/endorsements/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, brand, deal_type, deal_value, duration_years, sport,
      social_media_followers, market_reach, status, category, start_date, end_date
    } = req.body;

    const result = await pool.query(
      `UPDATE endorsements SET player_name=$1, brand=$2, deal_type=$3, deal_value=$4,
        duration_years=$5, sport=$6, social_media_followers=$7, market_reach=$8, status=$9,
        category=$10, start_date=$11, end_date=$12, updated_at=CURRENT_TIMESTAMP
       WHERE id=$13 RETURNING *`,
      [player_name, brand, deal_type, deal_value, duration_years, sport,
        social_media_followers, market_reach, status, category, start_date, end_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Endorsement not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating endorsement:', error);
    res.status(500).json({ error: 'Failed to update endorsement.' });
  }
});

// DELETE /api/endorsements/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM endorsements WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Endorsement not found.' });
    }

    res.json({ message: 'Endorsement deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting endorsement:', error);
    res.status(500).json({ error: 'Failed to delete endorsement.' });
  }
});

// POST /api/endorsements/ai-analyze
router.post('/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('endorsements', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
