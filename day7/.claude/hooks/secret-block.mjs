#!/usr/bin/env node
// PreToolUse hook: blocks writes/edits that look like they contain secrets.
// Exit 0 = allow. Exit 2 = block, message shown to Claude as the reason.
import process from 'node:process';

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/, // AWS access key id
  /sk-[a-zA-Z0-9]{20,}/, // generic API-key-shaped secret
  /(?:api|secret)[_-]?key\s*[:=]\s*['"][^'"]{16,}['"]/i,
];

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }

  const content = payload?.tool_input?.content ?? payload?.tool_input?.new_string ?? '';
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      process.stderr.write('Blocked: content appears to contain a secret/credential. Remove it before writing.\n');
      process.exit(2);
    }
  }
  process.exit(0);
});
