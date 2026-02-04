#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install it first." >&2
  exit 1
fi

cd "$ROOT_DIR"

FUNCTIONS=()
if [ "$#" -gt 0 ]; then
  FUNCTIONS=("$@")
else
  while IFS= read -r -d '' dir; do
    name="$(basename "$dir")"
    if [ "$name" = "_shared" ]; then
      continue
    fi
    FUNCTIONS+=("$name")
  done < <(find "$ROOT_DIR/supabase/functions" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
fi

if [ "${#FUNCTIONS[@]}" -eq 0 ]; then
  echo "No functions to deploy." >&2
  exit 1
fi

declare -A seen
duplicates=()
unique=()
for fn in "${FUNCTIONS[@]}"; do
  if [ -n "${seen[$fn]:-}" ]; then
    duplicates+=("$fn")
  else
    seen[$fn]=1
    unique+=("$fn")
  fi
done

if [ "${#duplicates[@]}" -gt 0 ]; then
  echo "Duplicate function names detected (auto-deduped): ${duplicates[*]}" >&2
fi

FUNCTIONS=("${unique[@]}")

echo "Deploying ${#FUNCTIONS[@]} function(s): ${FUNCTIONS[*]}"

for fn in "${FUNCTIONS[@]}"; do
  echo "---"
  echo "Deploying: $fn"
  supabase functions deploy "$fn"
done

echo "Done."
