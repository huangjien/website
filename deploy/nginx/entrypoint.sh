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

exec nginx -g 'daemon off;'
