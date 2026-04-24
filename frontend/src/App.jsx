import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ContractsPage from './pages/ContractsPage';
import SalaryCapsPage from './pages/SalaryCapsPage';
import EndorsementsPage from './pages/EndorsementsPage';
import FreeAgentsPage from './pages/FreeAgentsPage';
import NegotiationsPage from './pages/NegotiationsPage';
import PerformancePage from './pages/PerformancePage';
import DraftScoutingPage from './pages/DraftScoutingPage';
import InjuryReportsPage from './pages/InjuryReportsPage';
import TeamRostersPage from './pages/TeamRostersPage';
import TradeAnalysisPage from './pages/TradeAnalysisPage';
import ClientsPage from './pages/ClientsPage';
import FinancialsPage from './pages/FinancialsPage';
import LeagueRulesPage from './pages/LeagueRulesPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
      <Route path="/salary-caps" element={<ProtectedRoute><SalaryCapsPage /></ProtectedRoute>} />
      <Route path="/endorsements" element={<ProtectedRoute><EndorsementsPage /></ProtectedRoute>} />
      <Route path="/free-agents" element={<ProtectedRoute><FreeAgentsPage /></ProtectedRoute>} />
      <Route path="/negotiations" element={<ProtectedRoute><NegotiationsPage /></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
      <Route path="/draft-scouting" element={<ProtectedRoute><DraftScoutingPage /></ProtectedRoute>} />
      <Route path="/injury-reports" element={<ProtectedRoute><InjuryReportsPage /></ProtectedRoute>} />
      <Route path="/team-rosters" element={<ProtectedRoute><TeamRostersPage /></ProtectedRoute>} />
      <Route path="/trade-analysis" element={<ProtectedRoute><TradeAnalysisPage /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path="/financials" element={<ProtectedRoute><FinancialsPage /></ProtectedRoute>} />
      <Route path="/league-rules" element={<ProtectedRoute><LeagueRulesPage /></ProtectedRoute>} />
    </Routes>
  );
}
