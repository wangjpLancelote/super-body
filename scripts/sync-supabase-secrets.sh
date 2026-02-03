#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.example to .env and fill values."
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed. Install it first: brew install supabase/tap/supabase"
  exit 1
fi

PROJECT_REF="${1:-${SUPABASE_PROJECT_REF:-}}"
PROJECT_FLAG=()
if [ -n "$PROJECT_REF" ]; then
  PROJECT_FLAG=(--project-ref "$PROJECT_REF")
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

secrets=(
  SUPABASE_URL
  SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  AI_ASSISTANT_DRY_RUN
  AI_ASSISTANT_MODEL
  AI_ASSISTANT_MAX_TOKENS
  AI_ASSISTANT_TEMPERATURE
  STOCK_API_KEY
  STOCK_API_BASE_URL
)

args=()
for key in "${secrets[@]}"; do
  value="${!key:-}"
  if [ -n "$value" ]; then
    args+=("${key}=${value}")
  fi
done

if [ ${#args[@]} -eq 0 ]; then
  echo "No secrets found in $ENV_FILE. Nothing to sync."
  exit 1
fi

supabase secrets set "${PROJECT_FLAG[@]}" "${args[@]}"

echo "Supabase secrets synced for Edge Functions."
