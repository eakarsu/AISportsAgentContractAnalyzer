import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'team', 'league', 'position', 'injury_type', 'body_part',
  'severity', 'injury_date', 'expected_return', 'games_missed', 'contract_impact',
  'insurance_coverage', 'rehabilitation_status', 'notes', 'status',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'team', label: 'Team' },
  { key: 'injury_type', label: 'Injury' },
  { key: 'severity', label: 'Severity' },
  { key: 'rehabilitation_status', label: 'Rehab Status' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League', 'La Liga', 'Saudi Pro League'],
  severity: ['Minor', 'Moderate', 'Severe', 'Chronic', 'Career-Threatening'],
  status: ['Active', 'Recovering', 'Resolved', 'Chronic', 'Retired'],
  body_part: ['Knee', 'Ankle', 'Shoulder', 'Hamstring', 'Back', 'Head', 'Elbow', 'Hip', 'Calf', 'Groin', 'Achilles', 'Wrist', 'Foot'],
  insurance_coverage: ['true', 'false'],
};

export default function InjuryReportsPage() {
  return (
    <FeaturePage
      feature="injury-reports"
      title="Injury Reports"
      description="Monitor player injuries, recovery timelines, and contract implications"
      icon="🏥"
      accentColor="red"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
