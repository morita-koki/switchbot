#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICE_NAME="switchbot"

echo -e "${YELLOW}Stopping $SERVICE_NAME service...${NC}"
sudo systemctl stop "$SERVICE_NAME"

if ! systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}Service stopped successfully.${NC}"
else
    echo -e "${RED}Failed to stop service.${NC}"
    exit 1
fi
