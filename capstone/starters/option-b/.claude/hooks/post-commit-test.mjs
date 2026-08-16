#!/usr/bin/env node
// Skeleton hook for Track B deliverable 4 (CAPSTONE.md): "A post-commit
// hook that runs the test suite automatically and flags failures."
//
// This is NOT a git post-commit hook (a shell script git invokes on
// `git commit`) — it's a Claude Code hook, matching the stdin-JSON /
// exit-code contract this repo's other hooks already use. See
// `day7/.claude/hooks/lint-on-write.mjs` and
// `secret-block.mjs` for two worked examples of that contract:
//
//   - Claude Code pipes a single JSON payload to stdin describing the
//     tool call the hook fired on (shape depends on hook event — for a
//     PreToolUse/PostToolUse hook matching Bash, expect at least
//     `tool_name` and `tool_input.command`).
//   - Exit 0 = allow/silent pass.
//   - Exit 2 = block (PreToolUse) or surface feedback to Claude
//     (PostToolUse) — stderr becomes the message Claude sees.
//   - Any other exit code is typically treated as a non-blocking error.
//
// You still need to decide:
//   - Which hook event fires this. PostToolUse matching Bash and
//     inspecting `tool_input.command` for a commit (e.g. `git commit`)
//     is one approach; a Stop hook that always re-runs the suite is
//     another. Pick one and register it in `.claude/settings.json`
//     (see `day7/.claude/settings.json`'s `hooks` block for the
//     matcher + command registration shape).
//   - What "flags failures" means — block the next action, print a
//     summary, write to a file for `/qa-report` to pick up? Your call.
//
// Fill in the TODO below. Everything above it is the contract, not the
// deliverable.

import { execSync } from 'node:child_process';
import process from 'node:process';

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const command = payload?.tool_input?.command ?? '';

  // TODO: only proceed past this point for an actual commit. Something
  // like:
  //   if (!/\bgit\s+commit\b/.test(command)) process.exit(0);
  void command;

  // TODO: run the test suite (`npm test`) and inspect the result.
  // Reference `execSync` usage in
  // `day7/.claude/hooks/lint-on-write.mjs` for the pattern —
  // catch the thrown error on non-zero exit, read `err.stdout`, decide
  // what to write to stderr and what exit code to use.
  //
  // execSync('npm test', { stdio: 'pipe' });

  process.exit(0); // placeholder — replace once the TODO above is real
});
