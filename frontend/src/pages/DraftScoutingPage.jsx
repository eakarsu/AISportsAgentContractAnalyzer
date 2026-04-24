import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'prospect_name', 'college', 'league', 'position', 'age', 'height', 'weight',
  'projected_pick', 'projected_round', 'grade', 'strengths', 'weaknesses',
  'comparison_player', 'projected_contract_value', 'draft_year', 'status',
];

const tableColumns = [
  { key: 'prospect_name', label: 'Prospect' },
  { key: 'college', label: 'College/Origin' },
  { key: 'position', label: 'Position' },
  { key: 'projected_pick', label: 'Proj. Pick' },
  { key: 'grade', label: 'Grade' },
  { key: 'comparison_player', label: 'Comparison' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS'],
  status: ['Eligible', 'Declared', 'Posted', 'Drafted', 'Signed'],
  projected_round: ['1', '2', '3', '4', '5', '6', '7'],
};

export default function DraftScoutingPage() {
  return (
    <FeaturePage
      feature="draft-scouting"
      title="Draft Scouting"
      description="Track draft prospects, scouting reports, and projected draft positions"
      icon="🎯"
      accentColor="green"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
