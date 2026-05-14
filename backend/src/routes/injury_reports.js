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
    const result = await pool.query('SELECT * FROM injury_reports ORDER BY injury_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching injury reports:', error);
    res.status(500).json({ error: 'Failed to fetch injury reports.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM injury_reports WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Injury report not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching injury report:', error);
    res.status(500).json({ error: 'Failed to fetch injury report.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed, contract_impact, insurance_coverage, rehabilitation_status, notes, status } = req.body;
    const result = await pool.query(
      `INSERT INTO injury_reports (player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed, contract_impact, insurance_coverage, rehabilitation_status, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed || 0, contract_impact, insurance_coverage || false, rehabilitation_status, notes, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating injury report:', error);
    res.status(500).json({ error: 'Failed to create injury report.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed, contract_impact, insurance_coverage, rehabilitation_status, notes, status } = req.body;
    const result = await pool.query(
      `UPDATE injury_reports SET player_name=$1, team=$2, league=$3, position=$4, injury_type=$5, body_part=$6, severity=$7, injury_date=$8, expected_return=$9, games_missed=$10, contract_impact=$11, insurance_coverage=$12, rehabilitation_status=$13, notes=$14, status=$15, updated_at=CURRENT_TIMESTAMP
       WHERE id=$16 RETURNING *`,
      [player_name, team, league, position, injury_type, body_part, severity, injury_date, expected_return, games_missed, contract_impact, insurance_coverage, rehabilitation_status, notes, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Injury report not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating injury report:', error);
    res.status(500).json({ error: 'Failed to update injury report.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM injury_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Injury report not found.' });
    res.json({ message: 'Injury report deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting injury report:', error);
    res.status(500).json({ error: 'Failed to delete injury report.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('injury_reports', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
