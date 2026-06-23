#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/happy/apps/gpt-image-web}"
REPO_URL="${REPO_URL:-https://github.com/super-ai-company/gpt-image-web.git}"
BRANCH="${BRANCH:-main}"
LOCK_FILE="${LOCK_FILE:-/tmp/gpt-image-web-deploy.lock}"
STATE_FILE="${STATE_FILE:-$APP_DIR/.last_deployed_commit}"
LOG_PREFIX="[gpt-image-web deploy]"

mkdir -p "$APP_DIR"
cd "$APP_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "$LOG_PREFIX another deploy is running"
  exit 0
fi

remote_commit="$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | awk '{print $1}')"
if [[ -z "$remote_commit" ]]; then
  echo "$LOG_PREFIX failed to read remote commit for $BRANCH"
  exit 1
fi

local_commit=""
if [[ -f "$STATE_FILE" ]]; then
  local_commit="$(cat "$STATE_FILE")"
fi

if [[ -d .git ]]; then
  current_head="$(git rev-parse HEAD 2>/dev/null || true)"
  if [[ -n "$current_head" ]]; then
    local_commit="$current_head"
  fi
fi

if [[ "$remote_commit" == "$local_commit" ]]; then
  echo "$LOG_PREFIX already at $remote_commit"
  exit 0
fi

if [[ ! -d .git ]]; then
  parent_dir="$(dirname "$APP_DIR")"
  app_name="$(basename "$APP_DIR")"
  tmp_dir="$parent_dir/.${app_name}.clone.$$"
  preserved_env="$parent_dir/.${app_name}.env.$$"

  if [[ -f "$APP_DIR/.env" ]]; then
    cp "$APP_DIR/.env" "$preserved_env"
  fi

  rm -rf "$tmp_dir"
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$tmp_dir"
  rm -rf "$APP_DIR"
  mv "$tmp_dir" "$APP_DIR"
  if [[ -f "$preserved_env" ]]; then
    mv "$preserved_env" "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
  fi
  cd "$APP_DIR"
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  chmod 600 .env
  echo "$LOG_PREFIX created .env from .env.example; set OPENAI_API_KEY and ACCESS_PASSWORD before public use"
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

health_url="http://127.0.0.1:${HOST_PORT:-15230}/api/auth/session"
for attempt in {1..20}; do
  if curl -fsS "$health_url" >/dev/null; then
    echo "$remote_commit" > "$STATE_FILE"
    echo "$LOG_PREFIX deployed $remote_commit"
    exit 0
  fi
  sleep 3
done

echo "$LOG_PREFIX deploy failed health check: $health_url"
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=120 gpt-image-web || true
exit 1
