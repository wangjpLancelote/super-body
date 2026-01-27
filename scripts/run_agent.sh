#!/usr/bin/env bash
set -e

MAX_ITERS=5

for ((i=1; i<=MAX_ITERS; i++)); do
  phase=$(grep "Current Phase" agent/state.md | awk '{print $3}')

  echo "🔁 Iteration $i — Phase: $phase"

  case "$phase" in
    plan)
      codex exec -f agent/plan.prompt.md
      ;;
    build)
      codex exec -f agent/build.prompt.md
      ;;
    test)
      codex exec -f agent/test.prompt.md
      ;;
    review)
      codex exec -f agent/review.prompt.md
      ;;
    fix)
      codex exec -f agent/fix.prompt.md
      ;;
    done)
      echo "✅ Agent finished successfully"
      exit 0
      ;;
    *)
      echo "❌ Unknown phase: $phase"
      exit 1
      ;;
  esac
done

echo "⚠️ Max iterations reached, agent did not converge"
exit 1
