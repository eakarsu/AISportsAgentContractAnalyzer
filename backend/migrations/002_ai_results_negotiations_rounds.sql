-- Migration 002: AI results table, negotiation rounds, RBAC

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

-- Add role column with RBAC values
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'agent';

CREATE INDEX IF NOT EXISTS idx_ai_results_endpoint ON ai_results(endpoint);
CREATE INDEX IF NOT EXISTS idx_ai_results_user_id ON ai_results(user_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_neg_id ON negotiation_rounds(negotiation_id);
