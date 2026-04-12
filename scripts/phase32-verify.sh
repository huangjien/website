#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

docker build -f Dockerfile.edge -t website-edge:test .

SIM_PID=""
CID=""
cleanup() {
  if [[ -n "$CID" ]]; then
    docker stop "$CID" >/dev/null 2>&1 || true
    CID=""
  fi
  if [[ -n "$SIM_PID" ]]; then
    kill "$SIM_PID" >/dev/null 2>&1 || true
    SIM_PID=""
  fi
}
trap cleanup EXIT

SIM_PORT=19090 SIM_FAIL_COUNT=2 node scripts/phase32-upstream-sim.mjs >/tmp/phase32-transient.log 2>&1 &
SIM_PID=$!
sleep 1
CID="$(docker run -d --rm -p 18081:8080 -e RELAY_UPSTREAM_HOST=host.docker.internal -e RELAY_UPSTREAM_PORT=19090 website-edge:test)"
sleep 2
TRANSIENT_BODY="$(curl -fsS http://127.0.0.1:18081/)"
cleanup
if [[ "$TRANSIENT_BODY" != "ok" ]]; then
  echo "transient retry validation failed: body=$TRANSIENT_BODY"
  cat /tmp/phase32-transient.log
  exit 1
fi
echo "transient retry validation passed"

SIM_PORT=19091 SIM_FAIL_COUNT=10 node scripts/phase32-upstream-sim.mjs >/tmp/phase32-persistent.log 2>&1 &
SIM_PID=$!
sleep 1
CID="$(docker run -d --rm -p 18082:8080 -e RELAY_UPSTREAM_HOST=host.docker.internal -e RELAY_UPSTREAM_PORT=19091 website-edge:test)"
sleep 2
HTTP_CODE="$(curl -s -o /tmp/phase32-body.txt -w "%{http_code}" http://127.0.0.1:18082/)"
cleanup
if [[ "$HTTP_CODE" != "503" ]]; then
  echo "persistent fallback validation failed: status=$HTTP_CODE"
  cat /tmp/phase32-body.txt
  exit 1
fi
echo "persistent fallback validation passed"
