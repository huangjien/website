#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Home-Side Deployment Script${NC}"

# Check if .env.home exists
if [ ! -f ".env.home" ]; then
  echo -e "${RED}Error: .env.home file not found.${NC}"
  echo "Please create a .env.home file with the following required variables:"
  echo "TS_AUTHKEY=tskey-auth-..."
  echo "TS_ADVERTISE_TAGS=tag:home-upstream"
  echo "IMAGE_REPO=docker.io/huangjien/website"
  exit 1
fi

# Source the .env.home file
echo -e "${YELLOW}Loading environment variables from .env.home...${NC}"
set -a
source .env.home
set +a

# Validate required variables
REQUIRED_VARS=("TS_AUTHKEY" "TS_ADVERTISE_TAGS" "IMAGE_REPO")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}Error: Required variable $var is missing in .env.home.${NC}"
    exit 1
  fi
done

echo -e "${YELLOW}Pulling latest image...${NC}"
docker pull "${IMAGE_REPO}:latest"

echo -e "${YELLOW}Removing existing home-upstream container (if any)...${NC}"
docker rm -f home-upstream || true

echo -e "${YELLOW}Starting new home-upstream container...${NC}"
docker run -d \
  --name home-upstream \
  --restart unless-stopped \
  -e TS_AUTHKEY="${TS_AUTHKEY}" \
  -e TS_ADVERTISE_TAGS="${TS_ADVERTISE_TAGS}" \
  "${IMAGE_REPO}:latest"

echo -e "${GREEN}Deployment successful!${NC}"
echo "You can check the logs using: docker logs -f home-upstream"
