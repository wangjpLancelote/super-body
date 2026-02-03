#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.example to .env and fill values."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

write_header() {
  local target="$1"
  {
    echo "# Auto-generated from $ENV_FILE"
    echo "# Do not edit directly. Update .env and rerun: bash scripts/sync-env.sh"
    echo
  } > "$target"
}

append_kv() {
  local target="$1"
  local key="$2"
  local value="$3"
  if [ -n "${value}" ]; then
    printf "%s=%s\n" "$key" "$value" >> "$target"
  fi
}

stock_base_url="${STOCK_API_BASE_URL:-${NEXT_PUBLIC_STOCK_API_BASE_URL:-}}"
edge_base_url="${SUPABASE_EDGE_URL:-${NEXT_PUBLIC_SUPABASE_EDGE_URL:-}}"

web_env="$ROOT_DIR/apps/web/.env.local"
write_header "$web_env"
append_kv "$web_env" "NEXT_PUBLIC_SUPABASE_URL" "${SUPABASE_URL:-}"
append_kv "$web_env" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY:-}"
append_kv "$web_env" "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}"
append_kv "$web_env" "NEXT_PUBLIC_SUPABASE_EDGE_URL" "$edge_base_url"
append_kv "$web_env" "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
append_kv "$web_env" "OPENAI_ORG_ID" "${OPENAI_ORG_ID:-}"
append_kv "$web_env" "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
append_kv "$web_env" "AI_ASSISTANT_DRY_RUN" "${AI_ASSISTANT_DRY_RUN:-}"
append_kv "$web_env" "AI_ASSISTANT_MODEL" "${AI_ASSISTANT_MODEL:-}"
append_kv "$web_env" "AI_ASSISTANT_MAX_TOKENS" "${AI_ASSISTANT_MAX_TOKENS:-}"
append_kv "$web_env" "AI_ASSISTANT_TEMPERATURE" "${AI_ASSISTANT_TEMPERATURE:-}"
append_kv "$web_env" "NEXT_PUBLIC_STOCK_API_BASE_URL" "$stock_base_url"
append_kv "$web_env" "STOCK_API_KEY" "${STOCK_API_KEY:-}"

mobile_env="$ROOT_DIR/apps/mobile/.env"
write_header "$mobile_env"
append_kv "$mobile_env" "EXPO_PUBLIC_SUPABASE_URL" "${SUPABASE_URL:-}"
append_kv "$mobile_env" "EXPO_PUBLIC_SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY:-}"
append_kv "$mobile_env" "EXPO_PUBLIC_SUPABASE_EDGE_URL" "$edge_base_url"

ai_env="$ROOT_DIR/ai/.env.local"
write_header "$ai_env"
append_kv "$ai_env" "SUPABASE_URL" "${SUPABASE_URL:-}"
append_kv "$ai_env" "SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY:-}"
append_kv "$ai_env" "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}"
append_kv "$ai_env" "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
append_kv "$ai_env" "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
append_kv "$ai_env" "STOCK_API_KEY" "${STOCK_API_KEY:-}"
append_kv "$ai_env" "STOCK_API_BASE_URL" "$stock_base_url"

functions_env="$ROOT_DIR/supabase/functions/.env"
write_header "$functions_env"
append_kv "$functions_env" "SUPABASE_URL" "${SUPABASE_URL:-}"
append_kv "$functions_env" "SUPABASE_ANON_KEY" "${SUPABASE_ANON_KEY:-}"
append_kv "$functions_env" "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}"
append_kv "$functions_env" "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
append_kv "$functions_env" "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
append_kv "$functions_env" "AI_ASSISTANT_DRY_RUN" "${AI_ASSISTANT_DRY_RUN:-}"
append_kv "$functions_env" "AI_ASSISTANT_MODEL" "${AI_ASSISTANT_MODEL:-}"
append_kv "$functions_env" "AI_ASSISTANT_MAX_TOKENS" "${AI_ASSISTANT_MAX_TOKENS:-}"
append_kv "$functions_env" "AI_ASSISTANT_TEMPERATURE" "${AI_ASSISTANT_TEMPERATURE:-}"
append_kv "$functions_env" "STOCK_API_KEY" "${STOCK_API_KEY:-}"
append_kv "$functions_env" "STOCK_API_BASE_URL" "$stock_base_url"

echo "Env files generated:"
echo " - $web_env"
echo " - $mobile_env"
echo " - $ai_env"
echo " - $functions_env"
