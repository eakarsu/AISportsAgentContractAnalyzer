import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'team', 'league', 'total_cap', 'current_spending', 'cap_space',
  'dead_money', 'num_players', 'top_paid_player', 'top_salary',
  'cap_utilization', 'season',
];

const tableColumns = [
  { key: 'team', label: 'Team' },
  { key: 'league', label: 'League' },
  { key: 'total_cap', label: 'Total Cap' },
  { key: 'current_spending', label: 'Spending' },
  { key: 'cap_space', label: 'Cap Space' },
  { key: 'cap_utilization', label: 'Utilization' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS'],
};

export default function SalaryCapsPage() {
  return (
    <FeaturePage
      feature="salary-caps"
      title="Salary Caps"
      description="Optimize team salary cap utilization and spending"
      icon="💰"
      accentColor="green"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
