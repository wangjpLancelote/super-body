---
name: ls-la-listing
description: Format output for `ls` or `la` commands by listing directories and files separately with distinct labels. Use when the user types `ls` or `la` in this session.
---

# ls/la formatted listing

Follow this workflow whenever the user inputs `ls` or `la`.

## Workflow
1. Run the appropriate listing command in the current directory:
   - `ls`  -> `ls -p`
   - `la`  -> `ls -a -p`
2. Treat entries ending with `/` as directories. The rest are files.
3. Output a single line of space-separated entries in the original order.

## Output format
Render a single line of space-separated entries in the exact order returned by the listing command. Wrap lines naturally based on terminal width.
Do not add section headers or labels.
Render directory entries in green using ANSI color codes: `\x1b[32m` + entry + `\x1b[0m`.
Render files with default color (no ANSI codes).

Example:
\x1b[32msrc/\x1b[0m package.json \x1b[32mscripts/\x1b[0m README.md

## Rules
- For `la`, include hidden entries (dotfiles).
- Do not add extra commentary; only output the formatted listing.
- Keep the output in plain text with ANSI escape codes for directories only.
