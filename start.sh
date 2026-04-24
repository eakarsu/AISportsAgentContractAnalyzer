#!/bin/bash

# ============================================================
# AI Sports Agent Contract Analyzer - Start Script
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Project root
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║   🏆 AI Sports Agent Contract Analyzer           ║${NC}"
echo -e "${CYAN}${BOLD}║   Starting Application...                        ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# Load environment variables
# ============================================================
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✓${NC} Environment variables loaded"
else
    echo -e "${RED}✗${NC} .env file not found! Please create one."
    exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
DB_NAME=${DB_NAME:-sports_agent_analyzer}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# ============================================================
# Kill any processes on our ports
# ============================================================
echo -e "\n${BLUE}[1/6]${NC} Cleaning up ports..."

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "  ${YELLOW}→${NC} Killing processes on port $port (PIDs: $pids)"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "  ${GREEN}✓${NC} Port $port is free"
    fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ============================================================
# Check PostgreSQL
# ============================================================
echo -e "\n${BLUE}[2/6]${NC} Checking PostgreSQL..."

if command -v pg_isready &> /dev/null; then
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} PostgreSQL is running on port $DB_PORT"
    else
        echo -e "  ${YELLOW}→${NC} Starting PostgreSQL..."
        if command -v brew &> /dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        fi
        sleep 2
        if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
            echo -e "  ${GREEN}✓${NC} PostgreSQL started"
        else
            echo -e "  ${RED}✗${NC} Could not start PostgreSQL. Please start it manually."
            exit 1
        fi
    fi
else
    echo -e "  ${YELLOW}⚠${NC} pg_isready not found, assuming PostgreSQL is running"
fi

# ============================================================
# Setup Database
# ============================================================
echo -e "\n${BLUE}[3/6]${NC} Setting up database..."

# Create database if it doesn't exist
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "  ${GREEN}✓${NC} Database '$DB_NAME' exists"
else
    echo -e "  ${YELLOW}→${NC} Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || \
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Database created"
fi

# Run schema
echo -e "  ${YELLOW}→${NC} Running schema migration..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/src/db/schema.sql -q 2>/dev/null
echo -e "  ${GREEN}✓${NC} Schema applied"

# Seed data
echo -e "  ${YELLOW}→${NC} Seeding data (15+ items per feature)..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/src/db/seed.sql -q 2>/dev/null
echo -e "  ${GREEN}✓${NC} Data seeded successfully"

# Show counts
echo -e "  ${CYAN}─────────────────────────────────────${NC}"
COUNTS1=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "
SELECT
  'Contracts: ' || (SELECT COUNT(*) FROM contracts) ||
  ' | Salary Caps: ' || (SELECT COUNT(*) FROM salary_caps) ||
  ' | Endorsements: ' || (SELECT COUNT(*) FROM endorsements) ||
  ' | Free Agents: ' || (SELECT COUNT(*) FROM free_agents) ||
  ' | Negotiations: ' || (SELECT COUNT(*) FROM negotiations);
" 2>/dev/null)
COUNTS2=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "
SELECT
  'Performance: ' || (SELECT COUNT(*) FROM performance) ||
  ' | Draft Scouting: ' || (SELECT COUNT(*) FROM draft_scouting) ||
  ' | Injury Reports: ' || (SELECT COUNT(*) FROM injury_reports) ||
  ' | Rosters: ' || (SELECT COUNT(*) FROM team_rosters) ||
  ' | Trades: ' || (SELECT COUNT(*) FROM trade_analysis);
" 2>/dev/null)
echo -e "  ${CYAN}${COUNTS1}${NC}"
echo -e "  ${CYAN}${COUNTS2}${NC}"
echo -e "  ${CYAN}─────────────────────────────────────${NC}"

# ============================================================
# Install dependencies
# ============================================================
echo -e "\n${BLUE}[4/6]${NC} Installing dependencies..."

if [ ! -d backend/node_modules ]; then
    echo -e "  ${YELLOW}→${NC} Installing backend dependencies..."
    cd backend && npm install --silent && cd ..
    echo -e "  ${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "  ${GREEN}✓${NC} Backend dependencies already installed"
fi

if [ ! -d frontend/node_modules ]; then
    echo -e "  ${YELLOW}→${NC} Installing frontend dependencies..."
    cd frontend && npm install --silent && cd ..
    echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "  ${GREEN}✓${NC} Frontend dependencies already installed"
fi

# ============================================================
# Start Backend (with hot reload via nodemon)
# ============================================================
echo -e "\n${BLUE}[5/6]${NC} Starting backend server with hot reload..."

cd backend
npx nodemon src/server.js &
BACKEND_PID=$!
cd "$PROJECT_DIR"
echo -e "  ${GREEN}✓${NC} Backend starting on port $BACKEND_PORT (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo -e "  ${YELLOW}→${NC} Waiting for backend..."
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Backend is ready!"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "  ${YELLOW}⚠${NC} Backend may still be starting..."
    fi
done

# ============================================================
# Start Frontend (with hot reload via Vite)
# ============================================================
echo -e "\n${BLUE}[6/6]${NC} Starting frontend with hot reload..."

cd frontend
npx vite --port $FRONTEND_PORT --host &
FRONTEND_PID=$!
cd "$PROJECT_DIR"
echo -e "  ${GREEN}✓${NC} Frontend starting on port $FRONTEND_PORT (PID: $FRONTEND_PID)"

# Wait for frontend
sleep 3

# ============================================================
# Done!
# ============================================================
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║   🏆 Application Started Successfully!           ║${NC}"
echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║   Frontend:  ${CYAN}http://localhost:${FRONTEND_PORT}${GREEN}               ║${NC}"
echo -e "${GREEN}${BOLD}║   Backend:   ${CYAN}http://localhost:${BACKEND_PORT}${GREEN}               ║${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║   Login:                                         ║${NC}"
echo -e "${GREEN}${BOLD}║   📧 admin@sportsagent.com                       ║${NC}"
echo -e "${GREEN}${BOLD}║   🔑 password123                                 ║${NC}"
echo -e "${GREEN}${BOLD}║                                                  ║${NC}"
echo -e "${GREEN}${BOLD}║   Hot reload is enabled for both servers.        ║${NC}"
echo -e "${GREEN}${BOLD}║   Press Ctrl+C to stop all services.             ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# Cleanup handler
# ============================================================
cleanup() {
    echo ""
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    cleanup_port $BACKEND_PORT
    cleanup_port $FRONTEND_PORT
    echo -e "${GREEN}✓${NC} All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
