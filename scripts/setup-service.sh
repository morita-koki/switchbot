#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="$SCRIPT_DIR/switchbot.service"
SERVICE_NAME="switchbot"

echo -e "${GREEN}=== SwitchBot Service Setup ===${NC}"

# Copy service file to systemd
echo -e "${YELLOW}[1/3] Installing service file...${NC}"
sudo cp "$SERVICE_FILE" /etc/systemd/system/

# Reload systemd
echo -e "${YELLOW}[2/3] Reloading systemd daemon...${NC}"
sudo systemctl daemon-reload

# Enable service
echo -e "${YELLOW}[3/3] Enabling service...${NC}"
sudo systemctl enable "$SERVICE_NAME"

echo -e "${GREEN}=== Service setup completed! ===${NC}"
echo ""
echo "Available commands:"
echo "  Start:   sudo systemctl start $SERVICE_NAME"
echo "  Stop:    sudo systemctl stop $SERVICE_NAME"
echo "  Restart: sudo systemctl restart $SERVICE_NAME"
echo "  Status:  sudo systemctl status $SERVICE_NAME"
echo "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
