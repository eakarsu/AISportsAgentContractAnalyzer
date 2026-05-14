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

// GET /api/performance
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM performance');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM performance ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data.' });
  }
});

// GET /api/performance/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM performance WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Performance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching performance record:', error);
    res.status(500).json({ error: 'Failed to fetch performance record.' });
  }
});

// POST /api/performance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, team, league, position, season, games_played,
      points_per_game, efficiency_rating, win_shares, all_star_selections,
      mvp_votes, championship_wins, market_value_impact, trend
    } = req.body;

    const result = await pool.query(
      `INSERT INTO performance (player_name, team, league, position, season, games_played,
        points_per_game, efficiency_rating, win_shares, all_star_selections, mvp_votes,
        championship_wins, market_value_impact, trend)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [player_name, team, league, position, season, games_played,
        points_per_game, efficiency_rating, win_shares, all_star_selections || 0,
        mvp_votes || 0, championship_wins || 0, market_value_impact, trend]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating performance record:', error);
    res.status(500).json({ error: 'Failed to create performance record.' });
  }
});

// PUT /api/performance/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, team, league, position, season, games_played,
      points_per_game, efficiency_rating, win_shares, all_star_selections,
      mvp_votes, championship_wins, market_value_impact, trend
    } = req.body;

    const result = await pool.query(
      `UPDATE performance SET player_name=$1, team=$2, league=$3, position=$4, season=$5,
        games_played=$6, points_per_game=$7, efficiency_rating=$8, win_shares=$9,
        all_star_selections=$10, mvp_votes=$11, championship_wins=$12, market_value_impact=$13,
        trend=$14, updated_at=CURRENT_TIMESTAMP
       WHERE id=$15 RETURNING *`,
      [player_name, team, league, position, season, games_played,
        points_per_game, efficiency_rating, win_shares, all_star_selections,
        mvp_votes, championship_wins, market_value_impact, trend, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Performance record not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating performance record:', error);
    res.status(500).json({ error: 'Failed to update performance record.' });
  }
});

// DELETE /api/performance/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM performance WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Performance record not found.' });
    }

    res.json({ message: 'Performance record deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting performance record:', error);
    res.status(500).json({ error: 'Failed to delete performance record.' });
  }
});

// POST /api/performance/ai-analyze
router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis.' });
    }

    const result = await analyzeWithAI('performance', data);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

module.exports = router;
