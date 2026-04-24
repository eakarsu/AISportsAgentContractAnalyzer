import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'team', 'league', 'player_name', 'position', 'jersey_number', 'age',
  'contract_status', 'annual_salary', 'years_remaining', 'role',
  'performance_grade', 'trade_eligible', 'notes',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'team', label: 'Team' },
  { key: 'position', label: 'Position' },
  { key: 'annual_salary', label: 'Salary' },
  { key: 'role', label: 'Role' },
  { key: 'performance_grade', label: 'Grade' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League', 'La Liga'],
  contract_status: ['Under Contract', 'Expiring', 'Rookie Deal', 'Extension Eligible', 'Free Agent'],
  role: ['Franchise Player', 'Core Player', 'Starter', 'Rotation', 'Bench', 'Depth', 'Development'],
  performance_grade: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
  trade_eligible: ['true', 'false'],
};

export default function TeamRostersPage() {
  return (
    <FeaturePage
      feature="team-rosters"
      title="Team Rosters"
      description="Manage team rosters, player roles, and roster composition analysis"
      icon="👥"
      accentColor="purple"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
