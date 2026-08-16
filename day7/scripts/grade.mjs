#!/usr/bin/env node
// Day 7 — Block 1 deterministic grader.
//
// Inspects files on disk and runs real commands (jest) only — never reads
// chat logs or transcripts. Run as: node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand by the
// trainer and is NOT included in this script's total; that is printed as
// a reminder, not a score.
//
// Scope: this grades ONLY the Block 1 practical (the notifyService
// HTML-escaping fix, the hardened .claude/settings.json, and
// .claude/rules/*.md). It does not touch the capstone — that has its own
// rubric in capstone/CAPSTONE.md and is scored separately, by hand.
//
// Anti-cheat: for the escaping fix, this script writes its own crafted
// HTML-injection regression tests (independent of whatever the learner
// committed under tests/), confirms they pass against the current source,
// then temporarily overwrites src/services/notifyService.ts with this
// repo's known Day 7 starting-state (vulnerable) source, reruns the same
// tests, and confirms they now fail — proving the check actually
// discriminates fixed from unfixed code. It repeats the same revert check
// against the learner's OWN committed test, so a test that would pass
// whether or not the bug is fixed scores zero on that line. The original
// file is always restored from an in-memory backup in a `finally` block,
// even if grading errors out.

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1');

const results = [];

function record(criterion, points, max, detail) {
  results.push({ criterion, points, max, detail });
}

function readIfExists(relPath) {
  const p = path.join(root, relPath);
  if (!existsSync(p)) return null;
  try {
    return readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function run(cmd) {
  try {
    const stdout = execSync(cmd, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: typeof err.status === 'number' ? err.status : 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : '',
    };
  }
}

function runJestFile(relPath) {
  return run(`npx jest ${JSON.stringify(relPath)} --silent`);
}

function collectTestFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__grading__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectTestFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Known-vulnerable reference source, exactly as this repo ships at the
// start of Day 7 (base64-encoded to avoid escaping issues with the
// template literals / backticks this file contains). Used only
// transiently during the anti-cheat checks below — written to disk for
// a few seconds at most and always restored from a backup of whatever
// the learner's file actually contained, in a `finally` block.
// ---------------------------------------------------------------------
const KNOWN_BAD_NOTIFY_SERVICE_B64 =
  'aW1wb3J0IHsgVGFzaywgVXNlciB9IGZyb20gJy4uL3JlcG8vdGFza1JlcG8nOwoKZXhwb3J0IGludGVyZmFjZSBOb3RpZmljYXRpb24gewogIHRvOiBzdHJpbmc7CiAgc3ViamVjdDogc3RyaW5nOwogIGh0bWw6IHN0cmluZzsKfQoKZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVGFza0Fzc2lnbmVkTm90aWZpY2F0aW9uKHRhc2s6IFRhc2ssIHVzZXI6IFVzZXIpOiBOb3RpZmljYXRpb24gewogIGNvbnN0IHN1YmplY3QgPSBgTmV3IHRhc2sgYXNzaWduZWQ6ICR7dGFzay50aXRsZX1gOwogIGNvbnN0IGh0bWwgPSBgCiAgICA8ZGl2PgogICAgICA8cD5IaSAke3VzZXIubmFtZX0sPC9wPgogICAgICA8cD5Zb3UgaGF2ZSBiZWVuIGFzc2lnbmVkIGEgbmV3IHRhc2s6IDxzdHJvbmc+JHt0YXNrLnRpdGxlfTwvc3Ryb25nPjwvcD4KICAgICAgPHA+JHt0YXNrLmRlc2NyaXB0aW9ufTwvcD4KICAgICAgPHA+RHVlOiAke3Rhc2suZHVlRGF0ZX08L3A+CiAgICA8L2Rpdj4KICBgLnRyaW0oKTsKCiAgcmV0dXJuIHsgdG86IHVzZXIuZW1haWwsIHN1YmplY3QsIGh0bWwgfTsKfQoKZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVGFza0NvbXBsZXRlZE5vdGlmaWNhdGlvbih0YXNrOiBUYXNrLCB1c2VyOiBVc2VyKTogTm90aWZpY2F0aW9uIHsKICBjb25zdCBzdWJqZWN0ID0gYFRhc2sgY29tcGxldGVkOiAke3Rhc2sudGl0bGV9YDsKICBjb25zdCBodG1sID0gYAogICAgPGRpdj4KICAgICAgPHA+SGkgJHt1c2VyLm5hbWV9LDwvcD4KICAgICAgPHA+WW91ciB0YXNrICIke3Rhc2sudGl0bGV9IiBoYXMgYmVlbiBtYXJrZWQgY29tcGxldGUuPC9wPgogICAgPC9kaXY+CiAgYC50cmltKCk7CgogIHJldHVybiB7IHRvOiB1c2VyLmVtYWlsLCBzdWJqZWN0LCBodG1sIH07Cn0K';
const KNOWN_BAD_NOTIFY_SERVICE = Buffer.from(KNOWN_BAD_NOTIFY_SERVICE_B64, 'base64').toString('utf8');

// ---------------------------------------------------------------------
// Grader-authored (hidden) regression tests. Independent of whatever is
// committed under tests/, so a learner weakening or deleting their own
// regression test doesn't automatically pass this check.
// ---------------------------------------------------------------------
const ESCAPE_HIDDEN_TEST = `import { buildTaskAssignedNotification, buildTaskCompletedNotification } from '../../src/services/notifyService';
import { Task, User } from '../../src/repo/taskRepo';

function makeTask(overrides = {}) {
  return {
    id: 't-grading',
    userId: 'u-grading',
    title: 'Sample task',
    description: 'Sample description',
    status: 'open',
    dueDate: new Date().toISOString(),
    cost: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const user = { id: 'u-grading', name: 'Grader', email: 'grader@taskflow.dev' };

describe('[grading] notifyService HTML escaping — all three values, both functions', () => {
  it('escapes a script tag in the task title on the assigned notification', () => {
    const task = makeTask({ title: '<script>alert(1)</script>' });
    const n = buildTaskAssignedNotification(task, user);
    expect(n.html).not.toContain('<script>alert(1)</script>');
  });

  it('escapes an injection-shaped description on the assigned notification', () => {
    const task = makeTask({ description: '<img src=x onerror=alert(2)>' });
    const n = buildTaskAssignedNotification(task, user);
    expect(n.html).not.toContain('<img src=x onerror=alert(2)>');
  });

  it('escapes a script tag in the user name on the assigned notification', () => {
    const task = makeTask();
    const maliciousUser = { id: 'u-grading-2', name: '<script>alert(3)</script>', email: 'x@y.z' };
    const n = buildTaskAssignedNotification(task, maliciousUser);
    expect(n.html).not.toContain('<script>alert(3)</script>');
  });

  it('escapes a script tag in the task title on the completed notification', () => {
    const task = makeTask({ title: '<script>alert(4)</script>' });
    const n = buildTaskCompletedNotification(task, user);
    expect(n.html).not.toContain('<script>alert(4)</script>');
  });

  it('escapes a script tag in the user name on the completed notification', () => {
    const task = makeTask();
    const maliciousUser = { id: 'u-grading-3', name: '<script>alert(5)</script>', email: 'x@y.z' };
    const n = buildTaskCompletedNotification(task, maliciousUser);
    expect(n.html).not.toContain('<script>alert(5)</script>');
  });
});
`;

const PLAIN_TEXT_HIDDEN_TEST = `import { buildTaskAssignedNotification } from '../../src/services/notifyService';

describe('[grading] notifyService preserves ordinary plain text', () => {
  it('renders an ordinary task title, description, and user name unmangled', () => {
    const task = {
      id: 't-plain',
      userId: 'u-plain',
      title: 'Ship the Q3 report',
      description: 'Finish the quarterly numbers',
      status: 'open',
      dueDate: new Date().toISOString(),
      cost: 0,
      createdAt: new Date().toISOString(),
    };
    const user = { id: 'u-plain', name: 'Grace Hopper', email: 'grace@taskflow.dev' };
    const n = buildTaskAssignedNotification(task, user);
    expect(n.html).toContain('Ship the Q3 report');
    expect(n.html).toContain('Grace Hopper');
    expect(n.html).toContain('Finish the quarterly numbers');
  });
});
`;

const notifyServicePath = path.join(root, 'src', 'services', 'notifyService.ts');
const gradingDir = path.join(root, 'tests', '__grading__');
const escapeHiddenRel = 'tests/__grading__/notify.escape.grading.test.ts';
const plainHiddenRel = 'tests/__grading__/notify.plaintext.grading.test.ts';

// ---------------------------------------------------------------------
// Functionality (30)
// ---------------------------------------------------------------------
try {
  mkdirSync(gradingDir, { recursive: true });
  writeFileSync(path.join(root, escapeHiddenRel), ESCAPE_HIDDEN_TEST, 'utf8');
  writeFileSync(path.join(root, plainHiddenRel), PLAIN_TEXT_HIDDEN_TEST, 'utf8');

  // ---- Escaping fix (15 pts), anti-cheat revert-checked ----
  if (!existsSync(notifyServicePath)) {
    record('HTML escaping fix holds against crafted injection input', 0, 15, 'src/services/notifyService.ts not found');
  } else {
    const fixedRun = runJestFile(escapeHiddenRel);
    if (fixedRun.code !== 0) {
      record(
        'HTML escaping fix holds against crafted injection input',
        0,
        15,
        'crafted-input check fails against the current source — not all values in both functions are escaped yet',
      );
    } else {
      const backup = readFileSync(notifyServicePath, 'utf8');
      let revertFailedAsExpected = false;
      try {
        writeFileSync(notifyServicePath, KNOWN_BAD_NOTIFY_SERVICE, 'utf8');
        const revertRun = runJestFile(escapeHiddenRel);
        revertFailedAsExpected = revertRun.code !== 0;
      } finally {
        writeFileSync(notifyServicePath, backup, 'utf8');
      }
      if (revertFailedAsExpected) {
        record(
          'HTML escaping fix holds against crafted injection input',
          15,
          15,
          'crafted-input check passes on current source and correctly fails against the seeded-vulnerable source (anti-cheat revert-check OK)',
        );
      } else {
        record(
          'HTML escaping fix holds against crafted injection input',
          15,
          15,
          'crafted-input check passes on current source (anti-cheat revert-check was inconclusive on the grader side — does not reduce your score)',
        );
      }
    }
  }

  // ---- Plain text preserved (5 pts) ----
  {
    const plainRun = runJestFile(plainHiddenRel);
    record(
      'Plain, non-malicious content still renders correctly',
      plainRun.code === 0 ? 5 : 0,
      5,
      plainRun.code === 0 ? 'ordinary title/description/name render unmangled' : 'plain-text check failed — escaping may be corrupting ordinary content',
    );
  }
} finally {
  rmSync(gradingDir, { recursive: true, force: true });
}

// ---- Full suite green, no regressions (10 pts) ----
{
  const fullRun = run('npm test --silent');
  record(
    'Full test suite passes with no regressions',
    fullRun.code === 0 ? 10 : 0,
    10,
    fullRun.code === 0 ? '`npm test` exited 0' : '`npm test` failed — see `npm test` output',
  );
}

// ---------------------------------------------------------------------
// Tool usage (25)
// ---------------------------------------------------------------------
let learnerTestFiles = [];
{
  const testDir = path.join(root, 'tests');
  const allTestFiles = collectTestFiles(testDir);
  for (const f of allTestFiles) {
    const content = readFileSync(f, 'utf8');
    const importsNotify = /notifyService/.test(content);
    const looksInjectionShaped = /<script|onerror=|<img\s/i.test(content);
    if (importsNotify && looksInjectionShaped) {
      learnerTestFiles.push(f);
    }
  }

  if (learnerTestFiles.length === 0) {
    record('Committed regression test covers HTML injection and passes', 0, 10, 'no test under tests/ imports notifyService with an HTML-injection-shaped input');
  } else {
    const rels = learnerTestFiles.map((f) => path.relative(root, f));
    const cmd = `npx jest ${rels.map((r) => JSON.stringify(r)).join(' ')} --silent`;
    const passRun = run(cmd);
    record(
      'Committed regression test covers HTML injection and passes',
      passRun.code === 0 ? 10 : 0,
      10,
      passRun.code === 0 ? `found and passed: ${rels.join(', ')}` : `found ${rels.join(', ')} but jest exited ${passRun.code}`,
    );
  }
}

// ---- Anti-cheat on the learner's own committed test (5 pts) ----
{
  if (learnerTestFiles.length === 0 || !existsSync(notifyServicePath)) {
    record('Committed test correctly fails when the fix is reverted', 0, 5, 'no qualifying committed test to revert-check');
  } else {
    const rels = learnerTestFiles.map((f) => path.relative(root, f));
    const backup = readFileSync(notifyServicePath, 'utf8');
    let revertFailedAsExpected = false;
    try {
      writeFileSync(notifyServicePath, KNOWN_BAD_NOTIFY_SERVICE, 'utf8');
      const cmd = `npx jest ${rels.map((r) => JSON.stringify(r)).join(' ')} --silent`;
      const revertRun = run(cmd);
      revertFailedAsExpected = revertRun.code !== 0;
    } finally {
      writeFileSync(notifyServicePath, backup, 'utf8');
    }
    record(
      'Committed test correctly fails when the fix is reverted',
      revertFailedAsExpected ? 5 : 0,
      5,
      revertFailedAsExpected
        ? "learner's own test correctly goes red against the seeded-vulnerable source — it's a real regression test"
        : "learner's own test still passes against the seeded-vulnerable source — it isn't actually testing the fix",
    );
  }
}

// ---- .claude/rules substantive content (10 pts) ----
function scoreRulesFile(relPath, label, keywordPatterns) {
  const content = readIfExists(relPath);
  if (content === null) {
    record(label, 0, 5, `${relPath} not found`);
    return;
  }
  const nonBlankLines = content.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));
  const matchedKeywords = keywordPatterns.filter((re) => re.test(content));
  if (nonBlankLines.length >= 4 && matchedKeywords.length >= 2) {
    record(label, 5, 5, `${nonBlankLines.length} content line(s), covers ${matchedKeywords.length}/${keywordPatterns.length} expected topics`);
  } else if (nonBlankLines.length > 0) {
    record(label, 2, 5, `${nonBlankLines.length} content line(s), only ${matchedKeywords.length}/${keywordPatterns.length} expected topics — looks thin or generic`);
  } else {
    record(label, 0, 5, 'file exists but is empty');
  }
}

scoreRulesFile('.claude/rules/security.md', '.claude/rules/security.md is substantive', [
  /escap|sanitiz/i,
  /injection|xss/i,
  /ownership|authoriz/i,
  /secret|credential/i,
]);
scoreRulesFile('.claude/rules/testing.md', '.claude/rules/testing.md is substantive', [
  /sibling test|new source file/i,
  /revert|regression/i,
  /snapshot/i,
  /lint|build|test/i,
]);

// ---------------------------------------------------------------------
// Code quality (20): .claude/settings.json hardening
// ---------------------------------------------------------------------
const BASELINE_DENY = ['Bash(rm:*)'];
const BASELINE_ASK = ['Bash(git push:*)'];

let settingsParsed = null;
{
  const settingsRaw = readIfExists('.claude/settings.json');
  if (settingsRaw === null) {
    record('.claude/settings.json deny list hardened (secrets/credentials)', 0, 10, '.claude/settings.json not found');
    record('.claude/settings.json ask list hardened (risky operations)', 0, 10, '.claude/settings.json not found');
  } else {
    try {
      settingsParsed = JSON.parse(settingsRaw);
    } catch (err) {
      record('.claude/settings.json deny list hardened (secrets/credentials)', 0, 10, `invalid JSON: ${err.message}`);
      record('.claude/settings.json ask list hardened (risky operations)', 0, 10, `invalid JSON: ${err.message}`);
    }
  }
}

if (settingsParsed) {
  const perms = settingsParsed.permissions ?? {};
  const deny = Array.isArray(perms.deny) ? perms.deny : [];
  const ask = Array.isArray(perms.ask) ? perms.ask : [];

  const denyGrew = deny.length > BASELINE_DENY.length;
  const denyCoversSecrets = deny.some((r) => /env|secret|credential/i.test(r));
  if (denyGrew && denyCoversSecrets) {
    record('.claude/settings.json deny list hardened (secrets/credentials)', 10, 10, `${deny.length} deny rule(s), including secret/credential coverage`);
  } else if (denyGrew || denyCoversSecrets) {
    record('.claude/settings.json deny list hardened (secrets/credentials)', 4, 10, `${deny.length} deny rule(s) — grew: ${denyGrew}, covers secrets: ${denyCoversSecrets}`);
  } else {
    record('.claude/settings.json deny list hardened (secrets/credentials)', 0, 10, `deny list unchanged from baseline (${deny.length} rule(s))`);
  }

  const askGrew = ask.length > BASELINE_ASK.length;
  const askCoversRisky = ask.some((r) => /install|publish|package\.json|\.github/i.test(r));
  if (askGrew && askCoversRisky) {
    record('.claude/settings.json ask list hardened (risky operations)', 10, 10, `${ask.length} ask rule(s), including install/publish/risky-path coverage`);
  } else if (askGrew || askCoversRisky) {
    record('.claude/settings.json ask list hardened (risky operations)', 4, 10, `${ask.length} ask rule(s) — grew: ${askGrew}, covers risky ops: ${askCoversRisky}`);
  } else {
    record('.claude/settings.json ask list hardened (risky operations)', 0, 10, `ask list unchanged from baseline (${ask.length} rule(s))`);
  }
} else if (existsSync(path.join(root, '.claude', 'settings.json'))) {
  // JSON parse already recorded a zero above for both criteria.
}

// ---------------------------------------------------------------------
// Best practices (10): existing protections not weakened
// ---------------------------------------------------------------------
if (settingsParsed) {
  const hooks = settingsParsed.hooks ?? {};
  const postToolUse = JSON.stringify(hooks.PostToolUse ?? '');
  const preToolUse = JSON.stringify(hooks.PreToolUse ?? '');
  const stop = JSON.stringify(hooks.Stop ?? '');
  const hooksIntact =
    /lint-on-write\.mjs/.test(postToolUse) && /secret-block\.mjs/.test(preToolUse) && /notify-stop\.mjs/.test(stop);
  record(
    'Pre-existing hooks left intact while hardening permissions',
    hooksIntact ? 5 : 0,
    5,
    hooksIntact ? 'PostToolUse/PreToolUse/Stop hooks all still wired as before' : 'one or more of the pre-existing hooks appear to have been removed or altered',
  );

  const deny = Array.isArray(settingsParsed.permissions?.deny) ? settingsParsed.permissions.deny : [];
  const rmStillDenied = deny.some((r) => /rm:\*|Bash\(rm\)/.test(r));
  record(
    'Original rm:* deny protection still present',
    rmStillDenied ? 5 : 0,
    5,
    rmStillDenied ? 'Bash(rm:*) still denied after hardening' : 'the original Bash(rm:*) deny rule appears to have been dropped',
  );
} else {
  record('Pre-existing hooks left intact while hardening permissions', 0, 5, 'could not parse .claude/settings.json');
  record('Original rm:* deny protection still present', 0, 5, 'could not parse .claude/settings.json');
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 7 — Block 1 Assessment — Grade Report');
console.log('===========================================');
console.log('(Presentation, 15 pts, is scored by hand by the trainer — not included below.)');
console.log('(This scores Block 1 only. The capstone is graded separately via capstone/CAPSTONE.md.)');
console.log('');

const nameWidth = Math.max(...results.map((r) => r.criterion.length), 20);
for (const r of results) {
  const name = r.criterion.padEnd(nameWidth);
  const score = `${r.points}/${r.max}`.padStart(7);
  console.log(`${name}  ${score}   ${r.detail}`);
}

const total = results.reduce((sum, r) => sum + r.points, 0);
const max = results.reduce((sum, r) => sum + r.max, 0);
console.log('');
console.log(`TOTAL: ${total}/${max} (out of 85 — add hand-scored Presentation out of 15 for the final /100 mark)`);
console.log('');

if (total < 60) {
  console.log(`Below pass threshold on this script's scope (60/${max}). Exiting non-zero.`);
  process.exit(1);
} else {
  console.log('At or above pass threshold on this script\'s scope.');
  process.exit(0);
}
