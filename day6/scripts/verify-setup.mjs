#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const checks = [];
let hardFail = false;

function check(name, fn, { hard = true } = {}) {
  try {
    const result = fn();
    checks.push({ name, ok: true, detail: result, hard });
  } catch (err) {
    checks.push({ name, ok: false, detail: err.message, hard });
    if (hard) hardFail = true;
  }
}

check('Node major version >= 20', () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) throw new Error(`Node ${process.versions.node} is too old`);
  return `Node ${process.versions.node}`;
});

check('npm present', () => {
  const version = execSync('npm --version', { encoding: 'utf8' }).trim();
  return `npm ${version}`;
});

check(
  'claude CLI present',
  () => {
    const version = execSync('claude --version', { encoding: 'utf8' }).trim();
    return version;
  },
  { hard: false },
);

check('node_modules installed', () => {
  if (!existsSync(new URL('../node_modules', import.meta.url))) {
    throw new Error('node_modules not found — run npm install');
  }
  return 'present';
});

check('TypeScript compiles (tsc --noEmit)', () => {
  execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  return 'no type errors';
});

console.log('');
console.log('TaskFlow API — setup verification');
console.log('==================================');
for (const c of checks) {
  const icon = c.ok ? '✅' : c.hard ? '❌' : '⚠️';
  console.log(`${icon}  ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
}
console.log('');

if (hardFail) {
  console.log('One or more required checks failed. Fix the above before continuing.');
  process.exit(1);
} else {
  console.log('All required checks passed. (npm test is expected to show some intentional failures — see README/CLAUDE.md.)');
  process.exit(0);
}
