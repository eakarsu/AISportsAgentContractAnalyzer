import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'previous_team', 'league', 'position', 'age',
  'years_experience', 'last_contract_value', 'projected_value',
  'market_demand', 'injury_history', 'stats_summary', 'agent_name', 'status',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'previous_team', label: 'Previous Team' },
  { key: 'position', label: 'Position' },
  { key: 'projected_value', label: 'Projected Value' },
  { key: 'market_demand', label: 'Demand' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  status: ['Available', 'Signed', 'Negotiating', 'Retired'],
  market_demand: ['High', 'Medium', 'Low'],
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League'],
  position: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'PG', 'SG', 'SF', 'PF', 'C', 'SP', 'RP', 'OF', 'IF', 'GK', 'DEF', 'MID', 'FWD'],
};

export default function FreeAgentsPage() {
  return (
    <FeaturePage
      feature="free-agents"
      title="Free Agents"
      description="Analyze the free agency market and projected player values"
      icon="🏃"
      accentColor="amber"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
