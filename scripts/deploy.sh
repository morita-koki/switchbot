#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/koki/workspace/switchbot"
SERVICE_NAME="switchbot"

echo -e "${GREEN}=== SwitchBot Deploy Script ===${NC}"

cd "$PROJECT_DIR"

# Pull latest changes
echo -e "${YELLOW}[1/5] Pulling latest changes...${NC}"
git pull origin main

# Install backend dependencies
echo -e "${YELLOW}[2/5] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
uv sync

# Run database migrations
echo -e "${YELLOW}[3/5] Running database migrations...${NC}"
uv run alembic upgrade head

# Build frontend
echo -e "${YELLOW}[4/5] Building frontend...${NC}"
cd "$PROJECT_DIR/frontend"
npm install
npm run build

# Restart service
echo -e "${YELLOW}[5/5] Restarting service...${NC}"
sudo systemctl restart "$SERVICE_NAME"

# Check status
sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}=== Deploy completed successfully! ===${NC}"
    echo -e "${GREEN}Service status: running${NC}"
else
    echo -e "${RED}=== Deploy completed but service failed to start ===${NC}"
    sudo systemctl status "$SERVICE_NAME"
    exit 1
fi
