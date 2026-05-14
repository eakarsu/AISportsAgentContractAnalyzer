-- Migration 001: Initial schema (existing tables)
-- Run: psql $DATABASE_URL -f migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent',
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  email_verify_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  pdf_path VARCHAR(500),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
