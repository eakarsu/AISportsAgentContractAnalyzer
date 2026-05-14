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
    const result = await pool.query('SELECT * FROM team_rosters ORDER BY team, annual_salary DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team rosters:', error);
    res.status(500).json({ error: 'Failed to fetch team rosters.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_rosters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Roster entry not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching roster entry:', error);
    res.status(500).json({ error: 'Failed to fetch roster entry.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO team_rosters (team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible !== undefined ? trade_eligible : true, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating roster entry:', error);
    res.status(500).json({ error: 'Failed to create roster entry.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible, notes } = req.body;
    const result = await pool.query(
      `UPDATE team_rosters SET team=$1, league=$2, player_name=$3, position=$4, jersey_number=$5, age=$6, contract_status=$7, annual_salary=$8, years_remaining=$9, role=$10, performance_grade=$11, trade_eligible=$12, notes=$13, updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [team, league, player_name, position, jersey_number, age, contract_status, annual_salary, years_remaining, role, performance_grade, trade_eligible, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Roster entry not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating roster entry:', error);
    res.status(500).json({ error: 'Failed to update roster entry.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM team_rosters WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Roster entry not found.' });
    res.json({ message: 'Roster entry deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting roster entry:', error);
    res.status(500).json({ error: 'Failed to delete roster entry.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('team_rosters', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
