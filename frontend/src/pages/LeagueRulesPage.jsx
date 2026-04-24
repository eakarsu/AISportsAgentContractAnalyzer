import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'league', 'rule_category', 'rule_name', 'description', 'salary_cap_amount',
  'luxury_tax_threshold', 'roster_limit', 'min_salary', 'max_contract_years',
  'free_agency_start', 'trade_deadline', 'season', 'status',
];

const tableColumns = [
  { key: 'league', label: 'League' },
  { key: 'rule_category', label: 'Category' },
  { key: 'rule_name', label: 'Rule' },
  { key: 'salary_cap_amount', label: 'Salary Cap' },
  { key: 'roster_limit', label: 'Roster Limit' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League'],
  rule_category: ['Salary Cap', 'Free Agency', 'Draft', 'Roster', 'Trade', 'Contract', 'Revenue Sharing'],
  status: ['Current', 'Upcoming', 'Expired'],
};

export default function LeagueRulesPage() {
  return (
    <FeaturePage
      feature="league-rules"
      title="League Rules"
      description="CBA terms, salary caps, roster limits, and key dates by league"
      icon="📖"
      accentColor="amber"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
