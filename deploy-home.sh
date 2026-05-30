#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Home-Side Deployment Script${NC}"

ENV_FILE="${ENV_FILE:-.env.home}"

if [ ! -f "${ENV_FILE}" ]; then
  echo -e "${RED}Error: ${ENV_FILE} file not found.${NC}"
  echo "Please create ${ENV_FILE} with your app runtime variables (NEXTAUTH_*, GITHUB_*, OPENAI_*, etc.)."
  exit 1
fi

echo -e "${YELLOW}Loading environment variables from ${ENV_FILE}...${NC}"
set -a
source "${ENV_FILE}"
set +a

HOME_PORT="${HOME_PORT:-8080}"
CONTAINER_NAME="${CONTAINER_NAME:-website-home}"
IMAGE_NAME="${IMAGE_NAME:-website-home:latest}"
SKIP_BUILD="${SKIP_BUILD:-false}"

if [ "${SKIP_BUILD}" = "true" ]; then
  echo -e "${YELLOW}Skipping image build and reusing ${IMAGE_NAME}.${NC}"
else
  echo -e "${YELLOW}Building home runtime image...${NC}"
  docker build -t "${IMAGE_NAME}" .
fi

echo -e "${YELLOW}Removing existing home-upstream container (if any)...${NC}"
docker rm -f home-upstream || true

echo -e "${YELLOW}Starting new home-upstream container...${NC}"
docker run -d \
  --name home-upstream \
  --restart unless-stopped \
  -p "${HOME_PORT}:8080" \
  --env-file "${ENV_FILE}" \
  "${IMAGE_NAME}"

echo -e "${GREEN}Deployment successful!${NC}"
echo "You can check the logs using: docker logs -f home-upstream"
