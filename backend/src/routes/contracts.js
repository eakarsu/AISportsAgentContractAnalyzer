const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { analyzeWithAI } = require('../services/openrouter');
const { default: rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// AI rate limiter
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded. Maximum 20 AI calls per hour.' },
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req),
});

// Multer for PDF upload
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `contract_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) cb(null, true);
  else cb(new Error('Only PDF files allowed'));
}});

// Persist AI result
async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, model_used, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result), result.model || null, result.tokensUsed || 0]
    );
  } catch (e) { console.error('Failed to persist AI result:', e.message); }
}

// GET /api/contracts - List all contracts with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const sport = req.query.sport;
    const position = req.query.position;

    let where = [];
    let params = [];
    if (sport) { params.push(sport); where.push(`league ILIKE $${params.length}`); }
    if (position) { params.push(position); where.push(`position ILIKE $${params.length}`); }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM contracts ${whereStr}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit);
    params.push(offset);
    const result = await pool.query(
      `SELECT * FROM contracts ${whereStr} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts.' });
  }
});

// GET /api/contracts/:id - Get single contract
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract.' });
  }
});

// POST /api/contracts - Create new contract
router.post('/',
  authenticateToken,
  [
    body('player_name').notEmpty().withMessage('player_name is required'),
    body('team').notEmpty().withMessage('team is required'),
    body('league').notEmpty().withMessage('league is required'),
    body('position').notEmpty().withMessage('position is required'),
    body('contract_value').isNumeric().withMessage('contract_value must be numeric'),
    body('annual_salary').isNumeric().withMessage('annual_salary must be numeric'),
    body('contract_years').isInt({ min: 1 }).withMessage('contract_years must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        player_name, team, league, position, contract_value, annual_salary,
        contract_years, signing_bonus, guaranteed_money, status, start_date, end_date
      } = req.body;

      const result = await pool.query(
        `INSERT INTO contracts (player_name, team, league, position, contract_value, annual_salary,
          contract_years, signing_bonus, guaranteed_money, status, start_date, end_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [player_name, team, league, position, contract_value, annual_salary,
          contract_years, signing_bonus || 0, guaranteed_money || 0, status || 'Active',
          start_date, end_date, req.user?.id || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).json({ error: 'Failed to create contract.' });
    }
  }
);

// PUT /api/contracts/:id - Update contract
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, team, league, position, contract_value, annual_salary,
      contract_years, signing_bonus, guaranteed_money, status, start_date, end_date
    } = req.body;

    const result = await pool.query(
      `UPDATE contracts SET player_name=$1, team=$2, league=$3, position=$4, contract_value=$5,
        annual_salary=$6, contract_years=$7, signing_bonus=$8, guaranteed_money=$9, status=$10,
        start_date=$11, end_date=$12, updated_at=CURRENT_TIMESTAMP
       WHERE id=$13 RETURNING *`,
      [player_name, team, league, position, contract_value, annual_salary,
        contract_years, signing_bonus, guaranteed_money, status, start_date, end_date, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract.' });
  }
});

// DELETE /api/contracts/:id - Delete contract
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contracts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });
    res.json({ message: 'Contract deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract.' });
  }
});

// POST /api/contracts/ai-analyze - AI analysis with comparable injection
router.post('/ai-analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data is required for analysis.' });

    // Fetch comparable contracts from DB
    let comps = [];
    if (data.position || data.league) {
      const compResult = await pool.query(
        `SELECT player_name, team, league, position, contract_value, annual_salary, contract_years
         FROM contracts
         WHERE ($1::text IS NULL OR position ILIKE $1)
           AND ($2::text IS NULL OR league ILIKE $2)
         ORDER BY created_at DESC LIMIT 5`,
        [data.position || null, data.league || null]
      );
      comps = compResult.rows;
    }

    const result = await analyzeWithAI('contracts', data, comps);
    await persistAIResult(req.user?.id, 'contracts/ai-analyze', { data, comps }, result);
    res.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis.' });
  }
});

// POST /api/contracts/comparables - Query comparable player data
router.post('/comparables', authenticateToken, async (req, res) => {
  try {
    const { position, sport, league, limit: lim } = req.body;
    const limitVal = Math.min(20, parseInt(lim) || 10);

    const result = await pool.query(
      `SELECT player_name, team, league, position, contract_value, annual_salary, contract_years,
              signing_bonus, guaranteed_money, status
       FROM contracts
       WHERE ($1::text IS NULL OR position ILIKE $1)
         AND ($2::text IS NULL OR league ILIKE $2)
       ORDER BY contract_value DESC LIMIT $3`,
      [position || null, league || sport || null, limitVal]
    );

    res.json({ data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching comparables:', error);
    res.status(500).json({ error: 'Failed to fetch comparable contracts.' });
  }
});

// POST /api/contracts/upload-pdf - Upload PDF and extract key fields with AI
router.post('/upload-pdf', authenticateToken, aiRateLimiter, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required.' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Stub text extraction (real implementation would use pdf-parse or similar)
    const extractedText = `[PDF: ${fileName}] - Text extraction requires pdf-parse library. File saved at ${filePath}. Key fields would be extracted from the contract text.`;

    // Use AI to extract key fields from what we have
    const aiInput = {
      file_name: fileName,
      extracted_text: extractedText,
      instruction: 'Extract contract key fields: player name, team, signing bonus, base salary, contract years, option years, NTC clauses, escalators'
    };

    const { analyzeWithAI: analyze } = require('../services/openrouter');
    let extracted = {
      file_name: fileName,
      file_path: filePath,
      player_name: null,
      team: null,
      base_salary: null,
      signing_bonus: null,
      contract_years: null,
      option_years: null,
      ntc_clauses: null,
      escalators: null,
      notes: 'Install pdf-parse for full text extraction'
    };

    res.json({ success: true, file: { name: fileName, path: filePath }, extracted });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF.' });
  }
});

// POST /api/contracts/:id/parse-pdf - Parse PDF for existing contract
router.post('/:id/parse-pdf', authenticateToken, aiRateLimiter, upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'PDF file is required.' });

    const contract = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
    if (contract.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });

    const extractedData = {
      player_name: contract.rows[0].player_name,
      team: contract.rows[0].team,
      file: req.file.filename,
      notes: 'PDF uploaded. Install pdf-parse for full text extraction and AI field parsing.'
    };

    // Update contract with pdf_path
    await pool.query('UPDATE contracts SET pdf_path=$1, updated_at=NOW() WHERE id=$2', [req.file.path, id]);

    res.json({ success: true, contract_id: id, extracted: extractedData });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: 'Failed to parse PDF.' });
  }
});

module.exports = router;
