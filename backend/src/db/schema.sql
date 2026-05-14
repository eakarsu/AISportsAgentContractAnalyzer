-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Player Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  contract_value DECIMAL(15,2) NOT NULL,
  annual_salary DECIMAL(15,2) NOT NULL,
  contract_years INTEGER NOT NULL,
  signing_bonus DECIMAL(15,2) DEFAULT 0,
  guaranteed_money DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Salary Caps
CREATE TABLE IF NOT EXISTS salary_caps (
  id SERIAL PRIMARY KEY,
  team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  total_cap DECIMAL(15,2) NOT NULL,
  current_spending DECIMAL(15,2) NOT NULL,
  cap_space DECIMAL(15,2) NOT NULL,
  dead_money DECIMAL(15,2) DEFAULT 0,
  num_players INTEGER NOT NULL,
  top_paid_player VARCHAR(255),
  top_salary DECIMAL(15,2),
  cap_utilization DECIMAL(5,2),
  season VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Endorsements
CREATE TABLE IF NOT EXISTS endorsements (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  deal_type VARCHAR(100) NOT NULL,
  deal_value DECIMAL(15,2) NOT NULL,
  duration_years INTEGER NOT NULL,
  sport VARCHAR(100) NOT NULL,
  social_media_followers INTEGER,
  market_reach VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  category VARCHAR(100),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Free Agents
CREATE TABLE IF NOT EXISTS free_agents (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  previous_team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  years_experience INTEGER NOT NULL,
  last_contract_value DECIMAL(15,2),
  projected_value DECIMAL(15,2),
  market_demand VARCHAR(50),
  injury_history VARCHAR(255),
  stats_summary TEXT,
  agent_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Negotiations
CREATE TABLE IF NOT EXISTS negotiations (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  current_offer DECIMAL(15,2),
  asking_price DECIMAL(15,2),
  contract_years_offered INTEGER,
  guaranteed_money_offered DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'In Progress',
  priority VARCHAR(50) DEFAULT 'Medium',
  leverage_points TEXT,
  notes TEXT,
  deadline DATE,
  round INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Performance
CREATE TABLE IF NOT EXISTS performance (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  season VARCHAR(20) NOT NULL,
  games_played INTEGER NOT NULL,
  points_per_game DECIMAL(5,2),
  efficiency_rating DECIMAL(5,2),
  win_shares DECIMAL(5,2),
  all_star_selections INTEGER DEFAULT 0,
  mvp_votes INTEGER DEFAULT 0,
  championship_wins INTEGER DEFAULT 0,
  market_value_impact DECIMAL(15,2),
  trend VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Draft Scouting
CREATE TABLE IF NOT EXISTS draft_scouting (
  id SERIAL PRIMARY KEY,
  prospect_name VARCHAR(255) NOT NULL,
  college VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL,
  height VARCHAR(20),
  weight INTEGER,
  projected_pick INTEGER,
  projected_round INTEGER,
  grade DECIMAL(4,2),
  strengths TEXT,
  weaknesses TEXT,
  comparison_player VARCHAR(255),
  projected_contract_value DECIMAL(15,2),
  draft_year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'Eligible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Injury Reports
CREATE TABLE IF NOT EXISTS injury_reports (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  injury_type VARCHAR(255) NOT NULL,
  body_part VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  injury_date DATE,
  expected_return DATE,
  games_missed INTEGER DEFAULT 0,
  contract_impact DECIMAL(15,2),
  insurance_coverage BOOLEAN DEFAULT false,
  rehabilitation_status VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Team Rosters
CREATE TABLE IF NOT EXISTS team_rosters (
  id SERIAL PRIMARY KEY,
  team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  jersey_number INTEGER,
  age INTEGER,
  contract_status VARCHAR(100),
  annual_salary DECIMAL(15,2),
  years_remaining INTEGER,
  role VARCHAR(100),
  performance_grade VARCHAR(10),
  trade_eligible BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Trade Analysis
CREATE TABLE IF NOT EXISTS trade_analysis (
  id SERIAL PRIMARY KEY,
  trade_title VARCHAR(255) NOT NULL,
  team_a VARCHAR(255) NOT NULL,
  team_b VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  players_from_a TEXT NOT NULL,
  players_from_b TEXT NOT NULL,
  picks_from_a TEXT,
  picks_from_b TEXT,
  salary_impact_a DECIMAL(15,2),
  salary_impact_b DECIMAL(15,2),
  trade_grade_a VARCHAR(10),
  trade_grade_b VARCHAR(10),
  rationale TEXT,
  status VARCHAR(50) DEFAULT 'Proposed',
  trade_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Client Management
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  sport VARCHAR(100) NOT NULL,
  league VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  age INTEGER,
  phone VARCHAR(50),
  email VARCHAR(255),
  representation_start DATE,
  contract_status VARCHAR(100) DEFAULT 'Active',
  current_team VARCHAR(255),
  current_salary DECIMAL(15,2),
  commission_rate DECIMAL(5,2) DEFAULT 4.00,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Financial Tracker
CREATE TABLE IF NOT EXISTS financials (
  id SERIAL PRIMARY KEY,
  transaction_type VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  player_name VARCHAR(255),
  deal_name VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  commission_earned DECIMAL(15,2) DEFAULT 0,
  expense_category VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'Pending',
  payment_date DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. League Rules
CREATE TABLE IF NOT EXISTS league_rules (
  id SERIAL PRIMARY KEY,
  league VARCHAR(100) NOT NULL,
  rule_category VARCHAR(100) NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  salary_cap_amount DECIMAL(15,2),
  luxury_tax_threshold DECIMAL(15,2),
  roster_limit INTEGER,
  min_salary DECIMAL(15,2),
  max_contract_years INTEGER,
  free_agency_start VARCHAR(100),
  trade_deadline VARCHAR(100),
  season VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'Current',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. AI Results (caching and history)
CREATE TABLE IF NOT EXISTS ai_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  endpoint VARCHAR(100),
  input_data JSONB,
  result JSONB,
  model_used VARCHAR(255),
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 15. Negotiation Rounds (multi-round war room)
CREATE TABLE IF NOT EXISTS negotiation_rounds (
  id SERIAL PRIMARY KEY,
  negotiation_id INTEGER REFERENCES negotiations(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  offer_amount DECIMAL(15,2),
  counter_amount DECIMAL(15,2),
  offered_by VARCHAR(100),
  notes TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token VARCHAR(255);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(500);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE salary_caps ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE negotiations ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
