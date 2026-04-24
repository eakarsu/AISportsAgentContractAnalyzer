const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
});

// GET /api/clients/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client.' });
  }
});

// POST /api/clients
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      player_name, sport, league, position, age, phone, email,
      representation_start, contract_status, current_team, current_salary,
      commission_rate, notes, status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO clients (player_name, sport, league, position, age, phone, email,
        representation_start, contract_status, current_team, current_salary,
        commission_rate, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [player_name, sport, league, position, age, phone, email,
        representation_start, contract_status || 'Active', current_team, current_salary,
        commission_rate || 4.00, notes, status || 'Active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client.' });
  }
});

// PUT /api/clients/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      player_name, sport, league, position, age, phone, email,
      representation_start, contract_status, current_team, current_salary,
      commission_rate, notes, status
    } = req.body;

    const result = await pool.query(
      `UPDATE clients SET player_name=$1, sport=$2, league=$3, position=$4, age=$5,
        phone=$6, email=$7, representation_start=$8, contract_status=$9, current_team=$10,
        current_salary=$11, commission_rate=$12, notes=$13, status=$14, updated_at=CURRENT_TIMESTAMP
       WHERE id=$15 RETURNING *`,
      [player_name, sport, league, position, age, phone, email,
        representation_start, contract_status, current_team, current_salary,
        commission_rate, notes, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client.' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }
    res.json({ message: 'Client deleted successfully.', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client.' });
  }
});

module.exports = router;
