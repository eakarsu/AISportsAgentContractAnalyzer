import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'trade_title', 'team_a', 'team_b', 'league', 'players_from_a', 'players_from_b',
  'picks_from_a', 'picks_from_b', 'salary_impact_a', 'salary_impact_b',
  'trade_grade_a', 'trade_grade_b', 'rationale', 'status', 'trade_date',
];

const tableColumns = [
  { key: 'trade_title', label: 'Trade' },
  { key: 'team_a', label: 'Team A' },
  { key: 'team_b', label: 'Team B' },
  { key: 'trade_grade_a', label: 'Grade A' },
  { key: 'trade_grade_b', label: 'Grade B' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League', 'La Liga'],
  status: ['Proposed', 'Completed', 'Rejected', 'Hypothetical', 'In Discussion'],
  trade_grade_a: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
  trade_grade_b: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
};

export default function TradeAnalysisPage() {
  return (
    <FeaturePage
      feature="trade-analysis"
      title="Trade Analysis"
      description="Evaluate trade scenarios, grade deals, and analyze multi-team transactions"
      icon="🔄"
      accentColor="amber"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
