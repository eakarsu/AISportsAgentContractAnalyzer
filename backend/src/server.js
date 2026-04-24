const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const contractsRoutes = require('./routes/contracts');
const salaryCapsRoutes = require('./routes/salary_caps');
const endorsementsRoutes = require('./routes/endorsements');
const freeAgentsRoutes = require('./routes/free_agents');
const negotiationsRoutes = require('./routes/negotiations');
const performanceRoutes = require('./routes/performance');
const draftScoutingRoutes = require('./routes/draft_scouting');
const injuryReportsRoutes = require('./routes/injury_reports');
const teamRostersRoutes = require('./routes/team_rosters');
const tradeAnalysisRoutes = require('./routes/trade_analysis');
const clientsRoutes = require('./routes/clients');
const financialsRoutes = require('./routes/financials');
const leagueRulesRoutes = require('./routes/league_rules');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: [`http://localhost:${process.env.FRONTEND_PORT || 3000}`, 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/salary-caps', salaryCapsRoutes);
app.use('/api/salary_caps', salaryCapsRoutes);
app.use('/api/endorsements', endorsementsRoutes);
app.use('/api/free-agents', freeAgentsRoutes);
app.use('/api/free_agents', freeAgentsRoutes);
app.use('/api/negotiations', negotiationsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/draft-scouting', draftScoutingRoutes);
app.use('/api/draft_scouting', draftScoutingRoutes);
app.use('/api/injury-reports', injuryReportsRoutes);
app.use('/api/injury_reports', injuryReportsRoutes);
app.use('/api/team-rosters', teamRostersRoutes);
app.use('/api/team_rosters', teamRostersRoutes);
app.use('/api/trade-analysis', tradeAnalysisRoutes);
app.use('/api/trade_analysis', tradeAnalysisRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api/league-rules', leagueRulesRoutes);
app.use('/api/league_rules', leagueRulesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
