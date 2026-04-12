#!/bin/sh
set -eu

if [ -z "${RELAY_UPSTREAM_HOST:-}" ]; then
  echo "RELAY_UPSTREAM_HOST is required" >&2
  exit 1
fi

if [ -z "${RELAY_UPSTREAM_PORT:-}" ]; then
  echo "RELAY_UPSTREAM_PORT is required" >&2
  exit 1
fi

envsubst '${RELAY_UPSTREAM_HOST} ${RELAY_UPSTREAM_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

attempt=0
max_attempts="${RELAY_READY_MAX_ATTEMPTS:-30}"
sleep_seconds="${RELAY_READY_SLEEP_SECONDS:-1}"
while ! nc -z "$RELAY_UPSTREAM_HOST" "$RELAY_UPSTREAM_PORT" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "relay readiness failed for ${RELAY_UPSTREAM_HOST}:${RELAY_UPSTREAM_PORT}" >&2
    exit 1
  fi
  sleep "$sleep_seconds"
done

exec nginx -g 'daemon off;'
