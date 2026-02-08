#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICE_NAME="switchbot"

echo -e "${YELLOW}Starting $SERVICE_NAME service...${NC}"
sudo systemctl start "$SERVICE_NAME"

sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}Service started successfully.${NC}"
else
    echo -e "${RED}Failed to start service.${NC}"
    sudo systemctl status "$SERVICE_NAME"
    exit 1
fi
