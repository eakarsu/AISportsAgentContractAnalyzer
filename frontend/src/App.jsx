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
import ContractComparables from './pages/ContractComparables';
import CapSimulator from './pages/CapSimulator';
import NegotiationWarRoom from './pages/NegotiationWarRoom';
import PlayerValuationPage from './pages/PlayerValuationPage';
import InjuryImpactPage from './pages/InjuryImpactPage';
import EscrowHoldbackTracker from './pages/EscrowHoldbackTracker';
import Layout from './components/Layout';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

// === Batch 08 Gaps & Frontend Mounts ===
import CfMarketValuationEngineTrainedOnHistoricalContracts from './pages/CfMarketValuationEngineTrainedOnHistoricalContracts'
import CfInjuryTimelinePredictorCorrelatingInjuryTypeWith from './pages/CfInjuryTimelinePredictorCorrelatingInjuryTypeWith'
import CfNegotiationSimulationWithMonteCarloOutcomesAnd from './pages/CfNegotiationSimulationWithMonteCarloOutcomesAnd'
import CfEndorsementDealRecommenderMatchingAthletesToBrand from './pages/CfEndorsementDealRecommenderMatchingAthletesToBrand'
import CfMultiTeamTradeScenarioAnalyzerWithCap from './pages/CfMultiTeamTradeScenarioAnalyzerWithCap'
import CfLeagueDataIngestPipelinesWithScheduledSync from './pages/CfLeagueDataIngestPipelinesWithScheduledSync'
import GapNoAiDrivenPlayerValuationModelsPage from './pages/GapNoAiDrivenPlayerValuationModelsPage'
import GapNoInjuryPerformanceRegressionPrediction from './pages/GapNoInjuryPerformanceRegressionPrediction'
import GapNoAiSuggestedNegotiationTacticsBeyondStatic from './pages/GapNoAiSuggestedNegotiationTacticsBeyondStatic'
import GapNoEndorsementDealRecommender from './pages/GapNoEndorsementDealRecommender'
import GapNoIntegrationsWithOfficialLeagueApisNba from './pages/GapNoIntegrationsWithOfficialLeagueApisNba'
import GapNoEscrowHoldbackTrackingForCapCompliance from './pages/GapNoEscrowHoldbackTrackingForCapCompliance'
import GapNoContractTemplateLibraryWithAutoFill from './pages/GapNoContractTemplateLibraryWithAutoFill'
import GapNoMultiPartyNegotiationSupportAgentTeam from './pages/GapNoMultiPartyNegotiationSupportAgentTeam'
import GapNoWebhooksNotifications from './pages/GapNoWebhooksNotifications'
import GapNoAuditLogging from './pages/GapNoAuditLogging'
import GapNoPublicApiOrThirdPartyIntegrations from './pages/GapNoPublicApiOrThirdPartyIntegrations'
import CustomViewsPage from './pages/CustomViewsPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

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
      <Route path="/contract-comparables" element={<ProtectedRoute><ContractComparables /></ProtectedRoute>} />
      <Route path="/cap-simulator" element={<ProtectedRoute><CapSimulator /></ProtectedRoute>} />
      <Route path="/negotiation-war-room" element={<ProtectedRoute><NegotiationWarRoom /></ProtectedRoute>} />
      <Route path="/player-valuation" element={<ProtectedRoute><PlayerValuationPage /></ProtectedRoute>} />
      <Route path="/injury-impact" element={<ProtectedRoute><InjuryImpactPage /></ProtectedRoute>} />
      <Route path="/escrow-holdback-tracker" element={<ProtectedRoute><EscrowHoldbackTracker /></ProtectedRoute>} />
    {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-market-valuation-engine-trained-on-historical-contracts" element={<ProtectedRoute><CfMarketValuationEngineTrainedOnHistoricalContracts /></ProtectedRoute>} />
      <Route path="/cf-injury-timeline-predictor-correlating-injury-type-with-return" element={<ProtectedRoute><CfInjuryTimelinePredictorCorrelatingInjuryTypeWith /></ProtectedRoute>} />
      <Route path="/cf-negotiation-simulation-with-monte-carlo-outcomes-and-leverage" element={<ProtectedRoute><CfNegotiationSimulationWithMonteCarloOutcomesAnd /></ProtectedRoute>} />
      <Route path="/cf-endorsement-deal-recommender-matching-athletes-to-brand-opportunities" element={<ProtectedRoute><CfEndorsementDealRecommenderMatchingAthletesToBrand /></ProtectedRoute>} />
      <Route path="/cf-multi-team-trade-scenario-analyzer-with-cap-implications-and" element={<ProtectedRoute><CfMultiTeamTradeScenarioAnalyzerWithCap /></ProtectedRoute>} />
      <Route path="/cf-league-data-ingest-pipelines-with-scheduled-sync" element={<ProtectedRoute><CfLeagueDataIngestPipelinesWithScheduledSync /></ProtectedRoute>} />
      <Route path="/gap-no-ai-driven-player-valuation-models-page-exists-no" element={<ProtectedRoute><GapNoAiDrivenPlayerValuationModelsPage /></ProtectedRoute>} />
      <Route path="/gap-no-injury-performance-regression-prediction" element={<ProtectedRoute><GapNoInjuryPerformanceRegressionPrediction /></ProtectedRoute>} />
      <Route path="/gap-no-ai-suggested-negotiation-tactics-beyond-static-analysis" element={<ProtectedRoute><GapNoAiSuggestedNegotiationTacticsBeyondStatic /></ProtectedRoute>} />
      <Route path="/gap-no-endorsement-deal-recommender" element={<ProtectedRoute><GapNoEndorsementDealRecommender /></ProtectedRoute>} />
      <Route path="/gap-no-integrations-with-official-league-apis-nba-nfl" element={<ProtectedRoute><GapNoIntegrationsWithOfficialLeagueApisNba /></ProtectedRoute>} />
      <Route path="/gap-no-escrow-holdback-tracking-for-cap-compliance" element={<ProtectedRoute><GapNoEscrowHoldbackTrackingForCapCompliance /></ProtectedRoute>} />
      <Route path="/gap-no-contract-template-library-with-auto-fill" element={<ProtectedRoute><GapNoContractTemplateLibraryWithAutoFill /></ProtectedRoute>} />
      <Route path="/gap-no-multi-party-negotiation-support-agent-team-third-parties" element={<ProtectedRoute><GapNoMultiPartyNegotiationSupportAgentTeam /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-notifications" element={<ProtectedRoute><GapNoWebhooksNotifications /></ProtectedRoute>} />
      <Route path="/gap-no-audit-logging" element={<ProtectedRoute><GapNoAuditLogging /></ProtectedRoute>} />
      <Route path="/gap-no-public-api-or-third-party-integrations" element={<ProtectedRoute><GapNoPublicApiOrThirdPartyIntegrations /></ProtectedRoute>} />
      <Route path="/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />
      </Routes>
  );
}
