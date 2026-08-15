#!/usr/bin/env node
// PostToolUse hook: lints a file just written/edited by Claude Code.
// Exit 0 = pass (silent). Exit 2 = block-style feedback shown to Claude.
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

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !/\.(ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  try {
    execSync(`npx eslint "${filePath}"`, { stdio: 'pipe' });
    process.exit(0);
  } catch (err) {
    const output = err.stdout ? err.stdout.toString() : err.message;
    process.stderr.write(`ESLint found issues in ${filePath}:\n${output}\n`);
    process.exit(2);
  }
});
