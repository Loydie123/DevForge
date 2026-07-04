#!/bin/bash
# DevForge — Manual Deployment Script
# Usage: ./infra/ci-cd/deploy.sh [staging|production]
# Requires: Docker, docker compose, SSH access configured

set -euo pipefail

ENVIRONMENT=${1:-staging}
COMPOSE_FILE="infra/docker/docker-compose.full.yml"
APP_DIR="/opt/devforge"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()   { echo -e "${GREEN}[OK]${NC}    $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail() { echo -e "${RED}[FAIL]${NC}  $1"; exit 1; }

# ─── Validate environment ─────────────────────────────────────────────────────
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  fail "Invalid environment: '$ENVIRONMENT'. Use: staging or production"
fi

log "Deploying DevForge to → $ENVIRONMENT"
echo ""

# ─── Load SSH target from env ─────────────────────────────────────────────────
if [[ "$ENVIRONMENT" == "production" ]]; then
  SSH_HOST="${PROD_HOST:?PROD_HOST env var not set}"
  SSH_USER="${PROD_USER:?PROD_USER env var not set}"
  SSH_KEY="${PROD_SSH_KEY_PATH:-~/.ssh/id_rsa}"
else
  SSH_HOST="${STAGING_HOST:?STAGING_HOST env var not set}"
  SSH_USER="${STAGING_USER:?STAGING_USER env var not set}"
  SSH_KEY="${STAGING_SSH_KEY_PATH:-~/.ssh/id_rsa}"
fi

# ─── Build and push Docker images ─────────────────────────────────────────────
log "Building backend Docker image…"
docker build -t devforge-backend:latest ./apps/backend
ok "Backend built"

log "Building frontend Docker image…"
docker build -t devforge-frontend:latest ./apps/frontend
ok "Frontend built"

# ─── Deploy via SSH ───────────────────────────────────────────────────────────
log "Connecting to $SSH_USER@$SSH_HOST…"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" <<REMOTE
  set -e
  echo "Connected to \$(hostname)"
  cd $APP_DIR

  echo "Pulling latest images…"
  docker compose -f $COMPOSE_FILE pull

  echo "Starting services…"
  docker compose -f $COMPOSE_FILE up -d --remove-orphans

  echo "Running DB migrations…"
  docker compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

  echo "Cleaning up old images…"
  docker system prune -f

  echo "Health check…"
  sleep 5
  curl -sf http://localhost:4000/health && echo "Backend healthy" || echo "WARNING: health check failed"
REMOTE

echo ""
ok "Deployment to $ENVIRONMENT complete!"
log "URL: https://$([ "$ENVIRONMENT" == "production" ] && echo "devforge.app" || echo "staging.devforge.app")"
