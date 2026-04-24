import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'brand', 'deal_type', 'deal_value', 'duration_years',
  'sport', 'social_media_followers', 'market_reach', 'status',
  'category', 'start_date', 'end_date',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'brand', label: 'Brand' },
  { key: 'deal_value', label: 'Deal Value' },
  { key: 'deal_type', label: 'Type' },
  { key: 'market_reach', label: 'Market Reach' },
  { key: 'status', label: 'Status' },
];

const selectOptions = {
  status: ['Active', 'Pending', 'Expired', 'Negotiating'],
  deal_type: ['Sponsorship', 'Endorsement', 'Licensing', 'Appearance', 'Social Media', 'Ambassador'],
  sport: ['Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer', 'Tennis', 'Golf'],
  market_reach: ['Global', 'National', 'Regional', 'Local'],
  category: ['Apparel', 'Footwear', 'Beverage', 'Technology', 'Automotive', 'Finance', 'Food', 'Sports Equipment'],
};

export default function EndorsementsPage() {
  return (
    <FeaturePage
      feature="endorsements"
      title="Endorsements"
      description="Match players with endorsement deals and brand opportunities"
      icon="🤝"
      accentColor="purple"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
