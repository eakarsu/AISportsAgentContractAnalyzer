const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded. Maximum 20 AI calls per hour.' },
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req),
});

async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, model_used, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result), result.model || null, result.tokensUsed || 0]
    );
  } catch (e) { console.error('Failed to persist AI result:', e.message); }
}

// GET /api/negotiations with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM negotiations');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM negotiations ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);

    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch negotiations.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });

    // Also fetch rounds
    const rounds = await pool.query(
      'SELECT * FROM negotiation_rounds WHERE negotiation_id = $1 ORDER BY round_number ASC',
      [id]
    );

    res.json({ ...result.rows[0], rounds: rounds.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch negotiation.' });
  }
});

router.post('/',
  authenticateToken,
  [
    body('player_name').notEmpty().withMessage('player_name is required'),
    body('team').notEmpty().withMessage('team is required'),
    body('agent_name').notEmpty().withMessage('agent_name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        player_name, team, agent_name, current_offer, asking_price,
        contract_years_offered, guaranteed_money_offered, status, priority,
        leverage_points, notes, deadline, round
      } = req.body;

      const result = await pool.query(
        `INSERT INTO negotiations (player_name, team, agent_name, current_offer, asking_price,
          contract_years_offered, guaranteed_money_offered, status, priority, leverage_points,
          notes, deadline, round, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [player_name, team, agent_name, current_offer, asking_price,
          contract_years_offered, guaranteed_money_offered, status || 'In Progress',
          priority || 'Medium', leverage_points, notes, deadline, round || 1, req.user?.id || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create negotiation.' });
    }
  }
);

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

    if (result.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update negotiation.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM negotiations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });
    res.json({ message: 'Negotiation deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete negotiation.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('negotiations', data);
    await persistAIResult(req.user?.id, 'negotiations/ai-analyze', { data }, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

// POST /api/negotiations/:id/add-round - Add negotiation round
router.post('/:id/add-round',
  authenticateToken,
  [
    body('offer_amount').optional().isNumeric(),
    body('counter_amount').optional().isNumeric(),
    body('offered_by').notEmpty().withMessage('offered_by is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const { offer_amount, counter_amount, offered_by, notes } = req.body;

      // Verify negotiation exists
      const neg = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);
      if (neg.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });

      // Get next round number
      const roundResult = await pool.query(
        'SELECT COALESCE(MAX(round_number), 0) + 1 as next_round FROM negotiation_rounds WHERE negotiation_id = $1',
        [id]
      );
      const round_number = roundResult.rows[0].next_round;

      const result = await pool.query(
        `INSERT INTO negotiation_rounds (negotiation_id, round_number, offer_amount, counter_amount, offered_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, round_number, offer_amount || null, counter_amount || null, offered_by, notes || null]
      );

      // Update negotiation round count and current offer
      await pool.query(
        `UPDATE negotiations SET round=$1, current_offer=$2, updated_at=NOW() WHERE id=$3`,
        [round_number, offer_amount || neg.rows[0].current_offer, id]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding negotiation round:', error);
      res.status(500).json({ error: 'Failed to add negotiation round.' });
    }
  }
);

// POST /api/negotiations/:id/ai-analyze-rounds - AI analyzes ZOPA/BATNA per round
router.post('/:id/ai-analyze-rounds', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const neg = await pool.query('SELECT * FROM negotiations WHERE id = $1', [id]);
    if (neg.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });

    const rounds = await pool.query(
      'SELECT * FROM negotiation_rounds WHERE negotiation_id = $1 ORDER BY round_number ASC',
      [id]
    );

    const result = await analyzeWithAI('negotiations', neg.rows[0], rounds.rows);
    await persistAIResult(req.user?.id, 'negotiations/ai-analyze-rounds', { negotiation: neg.rows[0], rounds: rounds.rows }, result);

    // Store AI analysis on the latest round
    if (rounds.rows.length > 0) {
      const latestRound = rounds.rows[rounds.rows.length - 1];
      await pool.query(
        'UPDATE negotiation_rounds SET ai_analysis=$1 WHERE id=$2',
        [JSON.stringify(result.analysis), latestRound.id]
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform negotiation AI analysis.' });
  }
});

module.exports = router;
