import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'team', 'agent_name', 'current_offer', 'asking_price',
  'contract_years_offered', 'guaranteed_money_offered', 'status',
  'priority', 'leverage_points', 'notes', 'deadline', 'round',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'team', label: 'Team' },
  { key: 'current_offer', label: 'Current Offer' },
  { key: 'asking_price', label: 'Asking Price' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  status: ['In Progress', 'Completed', 'Stalled', 'Failed', 'Pending'],
  priority: ['High', 'Medium', 'Low', 'Critical'],
};

export default function NegotiationsPage() {
  return (
    <FeaturePage
      feature="negotiations"
      title="Negotiations"
      description="AI-powered contract negotiation tracking and analysis"
      icon="⚖️"
      accentColor="red"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
