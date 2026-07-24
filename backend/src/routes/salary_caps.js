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
  await pool.query(
    `INSERT INTO ai_results (user_id, endpoint, input_data, result, model_used, tokens_used)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result), result.model || null, result.tokensUsed || 0]
  );
}

// GET /api/salary_caps with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM salary_caps');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query('SELECT * FROM salary_caps ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);

    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching salary caps:', error);
    res.status(500).json({ error: 'Failed to fetch salary caps.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM salary_caps WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salary cap record not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salary cap.' });
  }
});

router.post('/',
  authenticateToken,
  [
    body('team').notEmpty().withMessage('team is required'),
    body('league').notEmpty().withMessage('league is required'),
    body('total_cap').isNumeric().withMessage('total_cap must be numeric'),
    body('season').notEmpty().withMessage('season is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        team, league, total_cap, current_spending, cap_space, dead_money,
        num_players, top_paid_player, top_salary, cap_utilization, season
      } = req.body;

      const result = await pool.query(
        `INSERT INTO salary_caps (team, league, total_cap, current_spending, cap_space, dead_money,
          num_players, top_paid_player, top_salary, cap_utilization, season, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [team, league, total_cap, current_spending, cap_space, dead_money || 0,
          num_players, top_paid_player, top_salary, cap_utilization, season, req.user?.id || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create salary cap record.' });
    }
  }
);

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

    if (result.rows.length === 0) return res.status(404).json({ error: 'Salary cap record not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update salary cap record.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM salary_caps WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salary cap record not found.' });
    res.json({ message: 'Salary cap record deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete salary cap record.' });
  }
});

router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });
    const result = await analyzeWithAI('salary_caps', data);
    await persistAIResult(req.user?.id, 'salary_caps/ai-analyze', { data }, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

// POST /api/salary-caps/calculate - Compute remaining cap from active contracts
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { team, league, total_cap } = req.body;
    if (!team || !total_cap) return res.status(400).json({ error: 'team and total_cap are required.' });

    const contracts = await pool.query(
      `SELECT player_name, annual_salary, contract_years, signing_bonus, guaranteed_money, status
       FROM contracts
       WHERE team ILIKE $1 AND ($2::text IS NULL OR league ILIKE $2) AND status = 'Active'`,
      [team, league || null]
    );

    const totalSpending = contracts.rows.reduce((sum, c) => sum + parseFloat(c.annual_salary || 0), 0);
    const capSpace = parseFloat(total_cap) - totalSpending;
    const capUtilization = ((totalSpending / parseFloat(total_cap)) * 100).toFixed(2);

    res.json({
      team,
      league,
      total_cap: parseFloat(total_cap),
      current_spending: totalSpending,
      cap_space: capSpace,
      cap_utilization: parseFloat(capUtilization),
      active_contracts: contracts.rows.length,
      players: contracts.rows
    });
  } catch (error) {
    console.error('Error calculating salary cap:', error);
    res.status(500).json({ error: 'Failed to calculate salary cap.' });
  }
});

// POST /api/salary-caps/simulate - What-if cap simulation
router.post('/simulate', authenticateToken, async (req, res) => {
  try {
    const { team, league, total_cap, player_id, action, new_salary } = req.body;
    if (!team || !total_cap || !action) return res.status(400).json({ error: 'team, total_cap, and action are required.' });

    // Get current cap state
    const contracts = await pool.query(
      `SELECT id, player_name, annual_salary, status FROM contracts
       WHERE team ILIKE $1 AND status = 'Active'`,
      [team]
    );

    let simulatedSpending = contracts.rows.reduce((sum, c) => sum + parseFloat(c.annual_salary || 0), 0);
    let impactDescription = '';

    if (player_id && action === 'sign' && new_salary) {
      simulatedSpending += parseFloat(new_salary);
      impactDescription = `Signing player at $${new_salary.toLocaleString()}/year`;
    } else if (player_id && action === 'cut') {
      const target = contracts.rows.find(c => c.id === parseInt(player_id));
      if (target) {
        simulatedSpending -= parseFloat(target.annual_salary);
        impactDescription = `Cutting ${target.player_name} (saves $${target.annual_salary.toLocaleString()}/year)`;
      }
    } else if (player_id && action === 'extend' && new_salary) {
      const target = contracts.rows.find(c => c.id === parseInt(player_id));
      if (target) {
        simulatedSpending = simulatedSpending - parseFloat(target.annual_salary) + parseFloat(new_salary);
        impactDescription = `Extending ${target.player_name}: $${target.annual_salary} -> $${new_salary}/year`;
      }
    }

    const simCapSpace = parseFloat(total_cap) - simulatedSpending;
    const currentSpending = contracts.rows.reduce((sum, c) => sum + parseFloat(c.annual_salary || 0), 0);

    res.json({
      simulation: {
        team, action, impact_description: impactDescription,
        total_cap: parseFloat(total_cap),
        current_spending: currentSpending,
        simulated_spending: simulatedSpending,
        current_cap_space: parseFloat(total_cap) - currentSpending,
        simulated_cap_space: simCapSpace,
        spending_delta: simulatedSpending - currentSpending,
        over_cap: simCapSpace < 0,
      }
    });
  } catch (error) {
    console.error('Error simulating cap:', error);
    res.status(500).json({ error: 'Failed to simulate cap impact.' });
  }
});

module.exports = router;
