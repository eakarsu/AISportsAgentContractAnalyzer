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

// GET /api/free_agents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM free_agents');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM free_agents ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching free agents:', error);
    res.status(500).json({ error: 'Failed to fetch free agents.' });
  }
});

// GET /api/free_agents/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM free_agents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Free agent not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching free agent:', error);
    res.status(500).json({ error: 'Failed to fetch free agent.' });
  }
});

// POST /api/free_agents
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, previous_team, league, position, age, years_experience,
      last_contract_value, projected_value, market_demand, injury_history,
      stats_summary, agent_name, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO free_agents (player_name, previous_team, league, position, age, years_experience,
        last_contract_value, projected_value, market_demand, injury_history, stats_summary, agent_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [player_name, previous_team, league, position, age, years_experience,
        last_contract_value, projected_value, market_demand, injury_history,
        stats_summary, agent_name, status || 'Available']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating free agent:', error);
    res.status(500).json({ error: 'Failed to create free agent.' });
  }
});

// PUT /api/free_agents/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, previous_team, league, position, age, years_experience,
      last_contract_value, projected_value, market_demand, injury_history,
      stats_summary, agent_name, status
    } = req.body;

    const result = await pool.query(
      `UPDATE free_agents SET player_name=$1, previous_team=$2, league=$3, position=$4, age=$5,
        years_experience=$6, last_contract_value=$7, projected_value=$8, market_demand=$9,
        injury_history=$10, stats_summary=$11, agent_name=$12, status=$13, updated_at=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [player_name, previous_team, league, position, age, years_experience,
        last_contract_value, projected_value, market_demand, injury_history,
        stats_summary, agent_name, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Free agent not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating free agent:', error);
    res.status(500).json({ error: 'Failed to update free agent.' });
  }
});

// DELETE /api/free_agents/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM free_agents WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Free agent not found.' });
    }

    res.json({ message: 'Free agent deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting free agent:', error);
    res.status(500).json({ error: 'Failed to delete free agent.' });
  }
});

// POST /api/free_agents/ai-analyze
router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('free_agents', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
