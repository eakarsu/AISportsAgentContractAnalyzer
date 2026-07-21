const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

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
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
if ((process.env.JWT_SECRET || '').length < 32 || !process.env.GOVERNANCE_TENANT_ID || !process.env.DATABASE_URL) throw new Error('JWT_SECRET (32+ characters), GOVERNANCE_TENANT_ID, and DATABASE_URL are required');
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', generalLimiter);

// Uploads static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken);
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
if (generatedRoutesEnabled) app.use('/api/ai', require('./routes/ai'));

// === Custom Views (4 features) ===
app.use('/api/custom-views', authenticateToken, require('./routes/customViews'));
app.use('/api/escrow-holdback-tracker', authenticateToken, require('./routes/escrowHoldbackTracker'));
app.use('/api/governed-contract-analysis', require('./governance'));
app.use('/api/governance', require('./governance'));

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
