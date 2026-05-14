const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');

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

// GET /api/ai/history - Get AI results history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const endpoint = req.query.endpoint;

    let whereClause = '';
    let params = [limit, offset];
    if (endpoint) {
      whereClause = 'WHERE endpoint = $3';
      params.push(endpoint);
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM ai_results ${endpoint ? 'WHERE endpoint=$1' : ''}`, endpoint ? [endpoint] : []);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, user_id, endpoint, result, model_used, tokens_used, created_at FROM ai_results ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI history.' });
  }
});

// POST /api/ai/comparable-analysis - Comparable Player RAG
router.post('/comparable-analysis', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { sport, position, target_salary, player_name } = req.body;
    if (!position) return res.status(400).json({ error: 'position is required.' });

    // Fetch top-5 comparable contracts from DB
    const comps = await pool.query(
      `SELECT player_name, team, league, position, contract_value, annual_salary, contract_years,
              signing_bonus, guaranteed_money
       FROM contracts
       WHERE ($1::text IS NULL OR position ILIKE $1)
         AND ($2::text IS NULL OR league ILIKE $2)
         AND status = 'Active'
       ORDER BY annual_salary DESC LIMIT 5`,
      [position, sport || null]
    );

    const inputData = { sport, position, target_salary, player_name, comparables: comps.rows };
    const prompt = `Perform a comparable player contract valuation analysis.
Player: ${player_name || 'Unknown'}
Position: ${position}
Sport/League: ${sport || 'Unknown'}
Target Salary: ${target_salary || 'Not specified'}

Top comparable contracts from database:
${JSON.stringify(comps.rows, null, 2)}

Respond ONLY with valid JSON:
{
  "analysis": {
    "risk_score": <number 1-10>,
    "market_value": "<recommended annual salary range>",
    "recommendations": ["<string>", ...],
    "red_flags": ["<string>", ...],
    "comparable_players": ["<player name - $salary/yr>", ...],
    "valuation_confidence": "<low|medium|high>",
    "summary": "<string>"
  }
}`;

    const { OPENROUTER_MODEL, parseAIJson } = require('../services/openrouter');
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.json({
        analysis: {
          risk_score: 5, market_value: 'Demo mode', recommendations: [],
          red_flags: [], comparable_players: comps.rows.map(c => `${c.player_name} - $${c.annual_salary}/yr`),
          valuation_confidence: 'low', summary: 'Configure OPENROUTER_API_KEY for real analysis'
        },
        comparables: comps.rows
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Sports Agent Contract Analyzer',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You are a professional sports agent AI. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500, temperature: 0.3,
      }),
    });

    const apiResult = await response.json();
    const rawContent = apiResult.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(rawContent);
    const resultData = { analysis: parsed?.analysis || { summary: rawContent }, model: apiResult.model, tokensUsed: apiResult.usage?.total_tokens || 0 };

    await persistAIResult(req.user?.id, 'ai/comparable-analysis', inputData, resultData);
    res.json({ ...resultData, comparables: comps.rows });
  } catch (error) {
    console.error('Comparable analysis error:', error);
    res.status(500).json({ error: 'Failed to perform comparable analysis.' });
  }
});

// GET /api/ai/agent-revenue - Agent revenue report
router.get('/agent-revenue', authenticateToken, async (req, res) => {
  try {
    const season = req.query.season;

    // Total commissions from clients
    const clientCommissions = await pool.query(
      `SELECT c.player_name, c.current_salary, c.commission_rate,
              (c.current_salary * c.commission_rate / 100) as commission_earned,
              c.sport, c.league, c.status
       FROM clients c
       WHERE c.status = 'Active' AND ($1::text IS NULL OR c.league ILIKE $1)
       ORDER BY commission_earned DESC`,
      [season || null]
    );

    const totalRevenue = clientCommissions.rows.reduce((sum, c) => sum + parseFloat(c.commission_earned || 0), 0);
    const totalContracts = clientCommissions.rows.length;

    // Financials summary
    const financials = await pool.query(
      `SELECT SUM(commission_earned) as total_commission, COUNT(*) as transactions
       FROM financials WHERE payment_status = 'Paid'`
    );

    res.json({
      summary: {
        total_commission_revenue: totalRevenue,
        active_clients: totalContracts,
        paid_transactions: parseInt(financials.rows[0].transactions || 0),
        total_paid_commissions: parseFloat(financials.rows[0].total_commission || 0),
      },
      clients: clientCommissions.rows
    });
  } catch (error) {
    console.error('Agent revenue error:', error);
    res.status(500).json({ error: 'Failed to generate agent revenue report.' });
  }
});

// POST /api/ai/negotiation-analysis - AI analyzes ZOPA/BATNA
router.post('/negotiation-analysis', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { negotiation_id } = req.body;
    if (!negotiation_id) return res.status(400).json({ error: 'negotiation_id is required.' });

    const neg = await pool.query('SELECT * FROM negotiations WHERE id = $1', [negotiation_id]);
    if (neg.rows.length === 0) return res.status(404).json({ error: 'Negotiation not found.' });

    const rounds = await pool.query(
      'SELECT * FROM negotiation_rounds WHERE negotiation_id = $1 ORDER BY round_number ASC',
      [negotiation_id]
    );

    const result = await analyzeWithAI('negotiations', neg.rows[0], rounds.rows);
    await persistAIResult(req.user?.id, 'ai/negotiation-analysis', { negotiation_id }, result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze negotiation.' });
  }
});

// POST /api/ai/player-valuation - Predict open-market value
router.post('/player-valuation', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { player_name, position, sport, age, recent_stats, injury_history } = req.body;
    if (!position) return res.status(400).json({ error: 'position is required.' });

    const recent = await pool.query(
      `SELECT player_name, team, league, position, contract_value, annual_salary, contract_years, signing_bonus, guaranteed_money
       FROM contracts WHERE position ILIKE $1 ORDER BY annual_salary DESC LIMIT 8`,
      [position]
    );

    const inputData = { player_name, position, sport, age, recent_stats, injury_history };
    const prompt = `You are a sports market valuation expert. Estimate fair open-market value for the player.
Player: ${player_name || 'Unknown'} | Position: ${position} | Sport: ${sport || 'Unknown'} | Age: ${age || 'unknown'}
Recent stats: ${JSON.stringify(recent_stats || {})}
Injury history: ${JSON.stringify(injury_history || [])}
Reference contracts: ${JSON.stringify(recent.rows)}

Respond ONLY with JSON:
{
  "valuation": {
    "annual_salary_low": <number>,
    "annual_salary_high": <number>,
    "fair_aav": <number>,
    "term_years": <number>,
    "guaranteed_pct": <0-100>,
    "drivers": ["..."],
    "risks": ["..."],
    "confidence": "low|medium|high"
  }
}`;

    const { OPENROUTER_MODEL, parseAIJson } = require('../services/openrouter');
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.json({ valuation: { fair_aav: 0, confidence: 'low', drivers: [], risks: [], note: 'Configure OPENROUTER_API_KEY for real analysis' } });
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Sports Agent Contract Analyzer',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You are a professional sports valuation analyst. Respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500, temperature: 0.3,
      }),
    });
    const apiResult = await response.json();
    const rawContent = apiResult.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(rawContent);
    const resultData = { valuation: parsed?.valuation || { summary: rawContent }, model: apiResult.model, tokensUsed: apiResult.usage?.total_tokens || 0 };
    await persistAIResult(req.user?.id, 'ai/player-valuation', inputData, resultData);
    res.json(resultData);
  } catch (error) {
    console.error('Player valuation error:', error);
    res.status(500).json({ error: 'Failed to perform player valuation.' });
  }
});

// POST /api/ai/injury-impact - Predict return timeline & earning impact
router.post('/injury-impact', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { player_name, position, sport, age, injury_type, injury_severity, current_salary } = req.body;
    if (!injury_type) return res.status(400).json({ error: 'injury_type is required.' });

    const inputData = { player_name, position, sport, age, injury_type, injury_severity, current_salary };
    const prompt = `You are a sports medicine and contracts analyst. Project return timeline and earning impact.
Player: ${player_name || 'Unknown'} | Pos: ${position || 'unknown'} | Sport: ${sport || 'unknown'} | Age: ${age || 'unknown'}
Injury: ${injury_type} (${injury_severity || 'unspecified severity'})
Current salary: ${current_salary || 'unknown'}

Respond ONLY with JSON:
{
  "impact": {
    "expected_recovery_weeks_low": <number>,
    "expected_recovery_weeks_high": <number>,
    "performance_decay_pct": <0-100>,
    "career_risk_level": "low|medium|high",
    "earnings_impact_pct": <0-100>,
    "negotiation_implications": ["..."],
    "rehab_milestones": ["..."],
    "confidence": "low|medium|high"
  }
}`;

    const { OPENROUTER_MODEL, parseAIJson } = require('../services/openrouter');
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
      return res.json({ impact: { confidence: 'low', note: 'Configure OPENROUTER_API_KEY for real analysis' } });
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Sports Agent Contract Analyzer',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You are a sports medicine and contracts analyst. Respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500, temperature: 0.3,
      }),
    });
    const apiResult = await response.json();
    const rawContent = apiResult.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(rawContent);
    const resultData = { impact: parsed?.impact || { summary: rawContent }, model: apiResult.model, tokensUsed: apiResult.usage?.total_tokens || 0 };
    await persistAIResult(req.user?.id, 'ai/injury-impact', inputData, resultData);
    res.json(resultData);
  } catch (error) {
    console.error('Injury impact error:', error);
    res.status(500).json({ error: 'Failed to predict injury impact.' });
  }
});

module.exports = router;
