import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'team', 'league', 'position', 'contract_value',
  'annual_salary', 'contract_years', 'signing_bonus', 'guaranteed_money',
  'status', 'start_date', 'end_date',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'team', label: 'Team' },
  { key: 'contract_value', label: 'Total Value' },
  { key: 'annual_salary', label: 'Annual Salary' },
  { key: 'contract_years', label: 'Years' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  status: ['Active', 'Pending', 'Expired', 'Negotiating'],
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League'],
  position: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'PG', 'SG', 'SF', 'PF', 'C', 'SP', 'RP', 'OF', 'IF', 'GK', 'DEF', 'MID', 'FWD'],
};

export default function ContractsPage() {
  return (
    <FeaturePage
      feature="contracts"
      title="Player Contracts"
      description="Benchmark and analyze player contracts across leagues"
      icon="📋"
      accentColor="blue"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
