const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded. Maximum 20 AI calls per hour.' },
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req),
});

async function persistAIResult(pool, userId, endpoint, inputData, result) {
  try {
    await pool.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result, model_used, tokens_used) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result), result.model || null, result.tokensUsed || 0]
    );
  } catch (e) { console.error('Failed to persist AI result:', e.message); }
}

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM draft_scouting ORDER BY projected_pick ASC, grade DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching draft scouting:', error);
    res.status(500).json({ error: 'Failed to fetch draft scouting data.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM draft_scouting WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Prospect not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching prospect:', error);
    res.status(500).json({ error: 'Failed to fetch prospect.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status } = req.body;
    const result = await pool.query(
      `INSERT INTO draft_scouting (prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status || 'Eligible']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: 'Failed to create prospect.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status } = req.body;
    const result = await pool.query(
      `UPDATE draft_scouting SET prospect_name=$1, college=$2, league=$3, position=$4, age=$5, height=$6, weight=$7, projected_pick=$8, projected_round=$9, grade=$10, strengths=$11, weaknesses=$12, comparison_player=$13, projected_contract_value=$14, draft_year=$15, status=$16, updated_at=CURRENT_TIMESTAMP
       WHERE id=$17 RETURNING *`,
      [prospect_name, college, league, position, age, height, weight, projected_pick, projected_round, grade, strengths, weaknesses, comparison_player, projected_contract_value, draft_year, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Prospect not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({ error: 'Failed to update prospect.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM draft_scouting WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Prospect not found.' });
    res.json({ message: 'Prospect deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting prospect:', error);
    res.status(500).json({ error: 'Failed to delete prospect.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('draft_scouting', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
