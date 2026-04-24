import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'sport', 'league', 'position', 'age', 'phone', 'email',
  'representation_start', 'contract_status', 'current_team', 'current_salary',
  'commission_rate', 'notes', 'status',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'sport', label: 'Sport' },
  { key: 'current_team', label: 'Team' },
  { key: 'current_salary', label: 'Salary' },
  { key: 'commission_rate', label: 'Commission %' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  sport: ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer'],
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League'],
  position: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'PG', 'SG', 'SF', 'PF', 'C', 'SP', 'RP', 'OF', 'IF', 'GK', 'DEF', 'MID', 'FWD'],
  contract_status: ['Active', 'Expiring', 'Free Agent', 'Rookie'],
  status: ['Active', 'Inactive', 'Prospect'],
};

export default function ClientsPage() {
  return (
    <FeaturePage
      feature="clients"
      title="Client Management"
      description="Manage your athlete clients, contact info, and representation details"
      icon="🧑‍💼"
      accentColor="blue"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
