#!/usr/bin/env bash
#
# SATYA — one-command.local runnner.
#
# Usage:
#   ./run.sh docker      # full stack via Docker Compose (recommended)
#   ./run.sh backend     # manual: run only the FastAPI backend
#   ./run.sh frontend    # manual: run only the Next.js frontend
#   ./run.sh setup       # manual: build/verify local venv + install deps
#   ./run.sh seed        # manual: create tables + demo data in Postgres
#
# Prerequisites
#   docker mode : Docker + Docker Compose
#   manual mode : Python 3.11-3.13, Node 20+, PostgreSQL 16 + pgvector running
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
ENV_FILE="$BACKEND/.env"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[satya]${NC} $*"; }
warn()  { echo -e "${YELLOW}[satya]${NC} $*"; }
err()   { echo -e "${RED}[satya]${NC} $*" >&2; }

require() { command -v "$1" >/dev/null 2>&1 || { err "missing: $1"; exit 1; }; }

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        cp "$BACKEND/.env.example" "$ENV_FILE"
        warn "created $ENV_FILE with placeholder values"
    fi
    if grep -q "sk-your-openai-api-key-here" "$ENV_FILE"; then
        warn "OPENAI_API_KEY is still a placeholder in $ENV_FILE — AI features will fail."
        warn "Edit $ENV_FILE and set a real key."
    fi
}

cmd_docker() {
    require docker
    docker compose version >/dev/null 2>&1 || { err "docker compose plugin not available (install Docker Compose v2)"; exit 1; }
    check_env
    info "building & starting containers..."
    docker compose up --build -d
    info "initialising database + demo data..."
    docker compose exec backend python seed.py
    info "up!  frontend=http://localhost:3000  api-docs=http://localhost:8000/api/docs"
    info "demo logins: demo@satya.ai / Demo@1234   admin@satya.ai / Admin@1234"
}

setup_venv() {
    [ -d "$BACKEND/venv" ] || python3 -m venv "$BACKEND/venv"
    # fix psycopg2-binary (no wheels on some Python versions) -> psycopg[binary]
    sed -i.bak 's/^psycopg2-binary==2.9.9/psycopg[binary]/' "$BACKEND/requirements.txt" \
        && rm -f "$BACKEND/requirements.txt.bak"
    "$BACKEND/venv/bin/pip" install --upgrade pip >/dev/null
    "$BACKEND/venv/bin/pip" install -r "$BACKEND/requirements.txt"
    # pydantic EmailStr
    "$BACKEND/venv/bin/pip" install "pydantic[email]"
    info "backend venv ready (use ./run.sh backend)"
}

cmd_setup() {
    require python3
    setup_venv
}

cmd_seed() {
    require python3
    [ -d "$BACKEND/venv" ] || setup_venv
    check_env
    (cd "$BACKEND" && "$BACKEND/venv/bin/python" seed.py)
}

cmd_backend() {
    require python3
    [ -d "$BACKEND/venv" ] || setup_venv
    check_env
    (cd "$BACKEND" && "$BACKEND/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload)
}

cmd_frontend() {
    require node
    require npm
    [ -d "$FRONTEND/node_modules" ] || (cd "$FRONTEND" && npm install)
    (cd "$FRONTEND" && NEXT_PUBLIC_API_URL="http://localhost:8000" npm run dev)
}

usage() {
    cat <<'EOF'
SATYA runner

Usage: ./run.sh <mode>

  docker    Full stack via Docker Compose (Postgres + backend + frontend)
  setup     Build/verify the backend Python venv and install deps
  backend   Run the FastAPI backend manually  (:8000)
  frontend  Run the Next.js frontend manually (:3000)
  seed      Create tables + demo data in Postgres
  help      Show this message
EOF
}

case "${1:-help}" in
    docker)   cmd_docker;;
    setup)    cmd_setup;;
    seed)     cmd_seed;;
    backend)  cmd_backend;;
    frontend) cmd_frontend;;
    help|-h|--help) usage;;
    *) err "unknown mode '$1'"; usage; exit 1;;
esac
