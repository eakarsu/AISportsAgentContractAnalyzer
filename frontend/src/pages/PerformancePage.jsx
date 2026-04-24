import React from 'react';
import FeaturePage from '../components/FeaturePage';

const fields = [
  'player_name', 'team', 'league', 'position', 'season',
  'games_played', 'points_per_game', 'efficiency_rating', 'win_shares',
  'all_star_selections', 'mvp_votes', 'championship_wins',
  'market_value_impact', 'trend',
];

const tableColumns = [
  { key: 'player_name', label: 'Player' },
  { key: 'team', label: 'Team' },
  { key: 'points_per_game', label: 'PPG' },
  { key: 'efficiency_rating', label: 'Efficiency' },
  { key: 'market_value_impact', label: 'Market Impact' },
  { key: 'trend', label: 'Trend' },
];

const selectOptions = {
  trend: ['Up', 'Down', 'Stable', 'Rising', 'Declining'],
  league: ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League'],
  position: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'PG', 'SG', 'SF', 'PF', 'C', 'SP', 'RP', 'OF', 'IF', 'GK', 'DEF', 'MID', 'FWD'],
};

export default function PerformancePage() {
  return (
    <FeaturePage
      feature="performance"
      title="Performance Analytics"
      description="Track player performance metrics and market value impact"
      icon="📊"
      accentColor="cyan"
      fields={fields}
      tableColumns={tableColumns}
      selectOptions={selectOptions}
    />
  );
}
