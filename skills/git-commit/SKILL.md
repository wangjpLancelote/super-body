---
name: git-commit
description: Automate git commits when the user asks to commit. Use when the user requests a git commit or says to commit changes.
---

# Git Commit

Follow this workflow when the user asks to create a git commit.

## Workflow
1. Run these commands to gather context:
   - `git status`
   - `git diff`
   - `git log -5 --oneline`
2. Identify relevant changes to stage for the requested commit.
3. Draft a concise commit message that summarizes the purpose of the changes.
4. Stage files with `git add`.
5. Create the commit with `git commit -m "<message>"`.
6. Run `git status` after the commit to confirm a clean state for the staged changes.

## Commit message guidelines
- Use 1-2 short sentences focusing on the "why".
- Match existing repo style if apparent from recent commits.
- Do not mention secrets or sensitive data.

## Safety rules
- Do not commit unless the user explicitly asks.
- Do not amend unless the user explicitly asks.
- Never use destructive git commands (reset --hard, checkout --, push --force).
- Do not commit files that likely contain secrets (e.g., .env, credentials.json). Warn the user if they request it.
- Do not push to remote unless the user explicitly asks.
