const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ============================================================
// VIZ 1: GET /api/custom-views/comp-salary-scatter
// Returns comparable contracts as (years, AAV) points grouped by position
// ============================================================
router.get('/comp-salary-scatter', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 100);
    const result = await pool.query(
      `SELECT id, player_name, team, league, position,
              contract_years AS years,
              annual_salary AS aav,
              contract_value, guaranteed_money, signing_bonus
       FROM contracts
       WHERE contract_years IS NOT NULL AND annual_salary IS NOT NULL
       ORDER BY contract_value DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    // Group by position
    const byPosition = {};
    for (const row of result.rows) {
      const pos = row.position || 'Unknown';
      if (!byPosition[pos]) byPosition[pos] = [];
      byPosition[pos].push({
        id: row.id,
        player_name: row.player_name,
        team: row.team,
        league: row.league,
        position: pos,
        years: Number(row.years) || 0,
        aav: Number(row.aav) || 0,
        contract_value: Number(row.contract_value) || 0,
        guaranteed_money: Number(row.guaranteed_money) || 0,
      });
    }

    const series = Object.entries(byPosition).map(([position, points]) => ({
      position,
      points,
      count: points.length,
    }));

    res.json({ series, total: result.rows.length });
  } catch (error) {
    console.error('Error in comp-salary-scatter:', error);
    res.status(500).json({ error: 'Failed to fetch comparable salary scatter.' });
  }
});

// ============================================================
// VIZ 2: GET /api/custom-views/clause-network
// Returns nodes/edges representing clauses across a contract
// ?contract_id=<id> (optional, defaults to most recent)
// ============================================================
router.get('/clause-network', authenticateToken, async (req, res) => {
  try {
    const contractId = req.query.contract_id
      ? parseInt(req.query.contract_id)
      : null;

    let contractResult;
    if (contractId) {
      contractResult = await pool.query('SELECT * FROM contracts WHERE id = $1', [contractId]);
    } else {
      contractResult = await pool.query('SELECT * FROM contracts ORDER BY contract_value DESC LIMIT 1');
    }
    if (contractResult.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });

    const c = contractResult.rows[0];

    // Build a clause network. Derive plausible clauses from contract fields.
    const baseSalary = Number(c.annual_salary) || 0;
    const signingBonus = Number(c.signing_bonus) || 0;
    const guaranteed = Number(c.guaranteed_money) || 0;
    const years = Number(c.contract_years) || 1;
    const total = Number(c.contract_value) || baseSalary * years;
    const performanceBonus = Math.round(total * 0.05);
    const optionYears = Math.max(1, Math.round(years / 4));
    const ntcThreshold = guaranteed > total * 0.6 ? 'Full NTC' : 'Partial NTC';

    const nodes = [
      { id: 'contract', type: 'input', position: { x: 0, y: 200 }, data: { label: `${c.player_name}\n${c.team} (${c.league})\n$${Math.round(total).toLocaleString()} / ${years} yrs` } },
      { id: 'base', position: { x: 280, y: 40 }, data: { label: `Base Salary\n$${Math.round(baseSalary).toLocaleString()}/yr` } },
      { id: 'bonus', position: { x: 280, y: 140 }, data: { label: `Signing Bonus\n$${Math.round(signingBonus).toLocaleString()}` } },
      { id: 'guarantee', position: { x: 280, y: 240 }, data: { label: `Guaranteed Money\n$${Math.round(guaranteed).toLocaleString()}` } },
      { id: 'performance', position: { x: 280, y: 340 }, data: { label: `Performance Bonus\n~$${performanceBonus.toLocaleString()}` } },
      { id: 'options', position: { x: 280, y: 440 }, data: { label: `Option Years\n${optionYears} yr(s)` } },
      { id: 'ntc', position: { x: 560, y: 100 }, data: { label: `No-Trade Clause\n${ntcThreshold}` } },
      { id: 'escalator', position: { x: 560, y: 220 }, data: { label: `Salary Escalator\n+3% / yr` } },
      { id: 'buyout', position: { x: 560, y: 340 }, data: { label: `Buyout / Dead Cap\n~$${Math.round(guaranteed * 0.4).toLocaleString()}` } },
      { id: 'arbitration', position: { x: 560, y: 460 }, data: { label: 'Arbitration Rights' } },
    ];

    const edges = [
      { id: 'e1', source: 'contract', target: 'base', label: 'pays' },
      { id: 'e2', source: 'contract', target: 'bonus', label: 'includes' },
      { id: 'e3', source: 'contract', target: 'guarantee', label: 'includes' },
      { id: 'e4', source: 'contract', target: 'performance', label: 'includes' },
      { id: 'e5', source: 'contract', target: 'options', label: 'includes' },
      { id: 'e6', source: 'guarantee', target: 'ntc', label: 'triggers' },
      { id: 'e7', source: 'base', target: 'escalator', label: 'modified by' },
      { id: 'e8', source: 'guarantee', target: 'buyout', label: 'caps' },
      { id: 'e9', source: 'options', target: 'arbitration', label: 'precedes' },
      { id: 'e10', source: 'performance', target: 'escalator', label: 'compounds' },
    ];

    res.json({ contract: c, nodes, edges });
  } catch (error) {
    console.error('Error in clause-network:', error);
    res.status(500).json({ error: 'Failed to fetch clause network.' });
  }
});

// ============================================================
// NON-VIZ 1: GET /api/custom-views/contract-pdf?contract_id=<id>
// Streams a full agreement PDF
// ============================================================
router.get('/contract-pdf', authenticateToken, async (req, res) => {
  try {
    const contractId = req.query.contract_id ? parseInt(req.query.contract_id) : null;
    if (!contractId) return res.status(400).json({ error: 'contract_id is required.' });

    const result = await pool.query('SELECT * FROM contracts WHERE id = $1', [contractId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found.' });

    const c = result.rows[0];

    const doc = new PDFDocument({ size: 'LETTER', margin: 60 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="contract_${contractId}.pdf"`);
    doc.pipe(res);

    // Cover
    doc.fontSize(22).fillColor('#0f172a').text('PLAYER CONTRACT AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#475569').text(`Contract ID: ${c.id}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).fillColor('#0f172a').text('PARTIES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#1e293b').text(
      `This Agreement is made between ${c.team} (the "Club"), a member of the ${c.league}, and ${c.player_name} (the "Player"), a professional athlete playing the ${c.position} position.`,
      { align: 'justify' }
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('1. TERM', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      `The term of this Agreement shall be ${c.contract_years} (${c.contract_years}) year(s), commencing on ${c.start_date || 'the date of execution'} and ending on ${c.end_date || `${c.contract_years} years thereafter`}.`,
      { align: 'justify' }
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('2. COMPENSATION', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      `Total Contract Value: $${Number(c.contract_value).toLocaleString()}\n` +
      `Average Annual Value (AAV): $${Number(c.annual_salary).toLocaleString()}\n` +
      `Signing Bonus: $${Number(c.signing_bonus || 0).toLocaleString()}\n` +
      `Guaranteed Money: $${Number(c.guaranteed_money || 0).toLocaleString()}`
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('3. PERFORMANCE OBLIGATIONS', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      `Player agrees to render skilled services as a ${c.position} for the Club, attend all team practices, training camps, exhibition, regular season, and playoff games, and comply with the Club's reasonable rules and regulations.`,
      { align: 'justify' }
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('4. TRADE / NO-TRADE PROVISIONS', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      `Given the guaranteed money of $${Number(c.guaranteed_money || 0).toLocaleString()}, the Player retains ${Number(c.guaranteed_money || 0) > Number(c.contract_value) * 0.6 ? 'a full' : 'a partial'} no-trade clause, subject to Club approval of any waiver thereof.`,
      { align: 'justify' }
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('5. INJURY AND MEDICAL', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      `If Player is injured in the performance of services hereunder, Club shall pay Player's reasonable hospital, medical, surgical, and dental expenses, and Player's salary continuation shall be governed by the applicable Collective Bargaining Agreement of the ${c.league}.`,
      { align: 'justify' }
    );
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('6. STATUS', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(`Current Contract Status: ${c.status || 'Active'}`);
    doc.moveDown();

    doc.fontSize(14).fillColor('#0f172a').text('7. ENTIRE AGREEMENT', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#1e293b').text(
      'This Agreement, together with any addenda and the applicable CBA, constitutes the entire agreement between the parties hereto with respect to its subject matter.',
      { align: 'justify' }
    );
    doc.moveDown(2);

    doc.fontSize(11).fillColor('#1e293b').text('_______________________________            _______________________________');
    doc.text(`${c.player_name} (Player)                          ${c.team} (Club Representative)`);

    doc.end();
  } catch (error) {
    console.error('Error generating contract PDF:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});

// ============================================================
// NON-VIZ 2: POST /api/custom-views/clause-comparison
// Body: { contract_a_id, contract_b_id, clause_types: [] }
// Returns: side-by-side comparison with risk score per clause
// ============================================================
router.post('/clause-comparison', authenticateToken, async (req, res) => {
  try {
    const { contract_a_id, contract_b_id, clause_types } = req.body || {};
    if (!contract_a_id || !contract_b_id) {
      return res.status(400).json({ error: 'contract_a_id and contract_b_id are required.' });
    }

    const types = Array.isArray(clause_types) && clause_types.length > 0
      ? clause_types
      : ['base_salary', 'signing_bonus', 'guaranteed_money', 'term', 'no_trade'];

    const [aRes, bRes] = await Promise.all([
      pool.query('SELECT * FROM contracts WHERE id = $1', [contract_a_id]),
      pool.query('SELECT * FROM contracts WHERE id = $1', [contract_b_id]),
    ]);

    if (aRes.rows.length === 0 || bRes.rows.length === 0) {
      return res.status(404).json({ error: 'One or both contracts not found.' });
    }

    const a = aRes.rows[0];
    const b = bRes.rows[0];

    const extractClause = (c, type) => {
      switch (type) {
        case 'base_salary':
          return { value: Number(c.annual_salary) || 0, text: `Base salary $${Number(c.annual_salary).toLocaleString()}/yr` };
        case 'signing_bonus':
          return { value: Number(c.signing_bonus) || 0, text: `Signing bonus $${Number(c.signing_bonus || 0).toLocaleString()}` };
        case 'guaranteed_money':
          return { value: Number(c.guaranteed_money) || 0, text: `Guaranteed $${Number(c.guaranteed_money || 0).toLocaleString()}` };
        case 'term':
          return { value: Number(c.contract_years) || 0, text: `${c.contract_years} year(s)` };
        case 'no_trade': {
          const gpct = (Number(c.guaranteed_money) || 0) / (Number(c.contract_value) || 1);
          return { value: gpct, text: gpct > 0.6 ? 'Full NTC' : 'Partial NTC' };
        }
        case 'total_value':
          return { value: Number(c.contract_value) || 0, text: `$${Number(c.contract_value).toLocaleString()} total` };
        default:
          return { value: 0, text: 'N/A' };
      }
    };

    const comparisons = types.map((t) => {
      const aClause = extractClause(a, t);
      const bClause = extractClause(b, t);
      const denom = Math.max(Math.abs(aClause.value), Math.abs(bClause.value), 1);
      const diffPct = Math.abs(aClause.value - bClause.value) / denom; // 0..1
      // Risk score 0..100: bigger absolute mismatch = higher negotiation risk
      const risk = Math.round(Math.min(100, diffPct * 100));
      return {
        clause_type: t,
        a: { contract_id: a.id, player_name: a.player_name, ...aClause },
        b: { contract_id: b.id, player_name: b.player_name, ...bClause },
        diff_pct: Number(diffPct.toFixed(3)),
        risk_score: risk,
        risk_label: risk >= 66 ? 'High' : risk >= 33 ? 'Medium' : 'Low',
      };
    });

    const overallRisk = Math.round(
      comparisons.reduce((acc, c) => acc + c.risk_score, 0) / comparisons.length
    );

    res.json({
      contract_a: { id: a.id, player_name: a.player_name, team: a.team, league: a.league, position: a.position },
      contract_b: { id: b.id, player_name: b.player_name, team: b.team, league: b.league, position: b.position },
      clause_types: types,
      comparisons,
      overall_risk_score: overallRisk,
      overall_risk_label: overallRisk >= 66 ? 'High' : overallRisk >= 33 ? 'Medium' : 'Low',
    });
  } catch (error) {
    console.error('Error in clause-comparison:', error);
    res.status(500).json({ error: 'Failed to compute clause comparison.' });
  }
});

module.exports = router;
