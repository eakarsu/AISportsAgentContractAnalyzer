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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM trade_analysis');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM trade_analysis ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching trade analysis:', error);
    res.status(500).json({ error: 'Failed to fetch trade analysis.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trade_analysis WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trade analysis not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching trade analysis:', error);
    res.status(500).json({ error: 'Failed to fetch trade analysis.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status, trade_date } = req.body;
    const result = await pool.query(
      `INSERT INTO trade_analysis (trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status, trade_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status || 'Proposed', trade_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating trade analysis:', error);
    res.status(500).json({ error: 'Failed to create trade analysis.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status, trade_date } = req.body;
    const result = await pool.query(
      `UPDATE trade_analysis SET trade_title=$1, team_a=$2, team_b=$3, league=$4, players_from_a=$5, players_from_b=$6, picks_from_a=$7, picks_from_b=$8, salary_impact_a=$9, salary_impact_b=$10, trade_grade_a=$11, trade_grade_b=$12, rationale=$13, status=$14, trade_date=$15, updated_at=CURRENT_TIMESTAMP
       WHERE id=$16 RETURNING *`,
      [trade_title, team_a, team_b, league, players_from_a, players_from_b, picks_from_a, picks_from_b, salary_impact_a, salary_impact_b, trade_grade_a, trade_grade_b, rationale, status, trade_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trade analysis not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating trade analysis:', error);
    res.status(500).json({ error: 'Failed to update trade analysis.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trade_analysis WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trade analysis not found.' });
    res.json({ message: 'Trade analysis deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting trade analysis:', error);
    res.status(500).json({ error: 'Failed to delete trade analysis.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('trade_analysis', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
