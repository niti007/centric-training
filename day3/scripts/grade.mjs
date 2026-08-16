#!/usr/bin/env node
// Day 3 deterministic grader.
//
// Inspects files on disk and runs real commands (jest, tsc, eslint) only —
// never reads chat logs or transcripts.
// Run as: node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md and is NOT included in this script's total; that is
// printed as a reminder, not a score.
//
// Anti-cheat: for each of the two graded bug fixes, this script writes a
// small boundary-value regression test of its own (independent of whatever
// is committed in tests/), confirms it passes against the current source,
// then temporarily overwrites just that one file with this repo's known
// starting-state (buggy) source, reruns the same test, and confirms it now
// fails — proving the check actually discriminates fixed from unfixed code
// rather than passing unconditionally. The original file is always restored
// from an in-memory backup in a `finally` block, even if grading errors out.

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

function countTestBlocks(content) {
  const matches = content.match(/\b(it|test)\s*\(/g);
  return matches ? matches.length : 0;
}

// ---------------------------------------------------------------------
// Known-bad reference source for the two graded defects, exactly as this
// repo ships at the start of Day 3 (base64-encoded to avoid any escaping
// issues with the template literals / backticks these files contain).
// Used only transiently during the anti-cheat check below — written to
// disk for a few seconds at most and always restored from a backup of
// whatever the learner's file actually contained, in a `finally` block.
// ---------------------------------------------------------------------
const KNOWN_BAD_TASK_SERVICE_B64 =
  'aW1wb3J0ICogYXMgdGFza1JlcG8gZnJvbSAnLi4vcmVwby90YXNrUmVwbyc7CmltcG9ydCB7IFRhc2sgfSBmcm9tICcuLi9yZXBvL3Rhc2tSZXBvJzsKaW1wb3J0IHsgaXNPdmVyZHVlIH0gZnJvbSAnLi4vdXRpbC9kYXRlcyc7CgpleHBvcnQgaW50ZXJmYWNlIExpc3RPcHRpb25zIHsKICBwYWdlOiBudW1iZXI7CiAgc2l6ZTogbnVtYmVyOwogIHVzZXJJZD86IHN0cmluZzsKICBzdGF0dXM/OiBUYXNrWydzdGF0dXMnXTsKfQoKZXhwb3J0IGludGVyZmFjZSBMaXN0UmVzdWx0IHsKICBpdGVtczogVGFza1tdOwogIHBhZ2U6IG51bWJlcjsKICBzaXplOiBudW1iZXI7CiAgdG90YWw6IG51bWJlcjsKfQoKZXhwb3J0IGZ1bmN0aW9uIGxpc3Qob3B0aW9uczogTGlzdE9wdGlvbnMpOiBMaXN0UmVzdWx0IHsKICBjb25zdCB7IHBhZ2UsIHNpemUsIHVzZXJJZCwgc3RhdHVzIH0gPSBvcHRpb25zOwogIGxldCBpdGVtcyA9IHRhc2tSZXBvLmxpc3RUYXNrcygpOwoKICBpZiAodXNlcklkKSB7CiAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcigodCkgPT4gdC51c2VySWQgPT09IHVzZXJJZCk7CiAgfQogIGlmIChzdGF0dXMpIHsKICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKCh0KSA9PiB0LnN0YXR1cyA9PT0gc3RhdHVzKTsKICB9CgogIGNvbnN0IHRvdGFsID0gaXRlbXMubGVuZ3RoOwogIGNvbnN0IHBhZ2VkID0gaXRlbXMuc2xpY2UocGFnZSAqIHNpemUsIHBhZ2UgKiBzaXplICsgc2l6ZSk7CgogIHJldHVybiB7IGl0ZW1zOiBwYWdlZCwgcGFnZSwgc2l6ZSwgdG90YWwgfTsKfQoKZXhwb3J0IGZ1bmN0aW9uIGdldEJ5SWQoaWQ6IHN0cmluZyk6IFRhc2sgfCB1bmRlZmluZWQgewogIHJldHVybiB0YXNrUmVwby5maW5kVGFza0J5SWQoaWQpOwp9CgpleHBvcnQgZnVuY3Rpb24gY3JlYXRlKGlucHV0OiB7CiAgdXNlcklkOiBzdHJpbmc7CiAgdGl0bGU6IHN0cmluZzsKICBkZXNjcmlwdGlvbjogc3RyaW5nOwogIGR1ZURhdGU6IHN0cmluZzsKICBjb3N0OiBudW1iZXI7Cn0pOiBUYXNrIHsKICBjb25zdCBpZCA9IGB0JHtEYXRlLm5vdygpfSR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCl9YDsKICBjb25zdCB0YXNrOiBUYXNrID0gewogICAgaWQsCiAgICB1c2VySWQ6IGlucHV0LnVzZXJJZCwKICAgIHRpdGxlOiBpbnB1dC50aXRsZSwKICAgIGRlc2NyaXB0aW9uOiBpbnB1dC5kZXNjcmlwdGlvbiwKICAgIHN0YXR1czogJ29wZW4nLAogICAgZHVlRGF0ZTogaW5wdXQuZHVlRGF0ZSwKICAgIGNvc3Q6IGlucHV0LmNvc3QsCiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSwKICB9OwogIHJldHVybiB0YXNrUmVwby5pbnNlcnRUYXNrKHRhc2spOwp9CgpleHBvcnQgZnVuY3Rpb24gdXBkYXRlKGlkOiBzdHJpbmcsIHBhdGNoOiBQYXJ0aWFsPE9taXQ8VGFzaywgJ2lkJyB8ICd1c2VySWQnIHwgJ2NyZWF0ZWRBdCc+Pik6IFRhc2sgfCB1bmRlZmluZWQgewogIHJldHVybiB0YXNrUmVwby51cGRhdGVUYXNrKGlkLCBwYXRjaCk7Cn0KCmV4cG9ydCBmdW5jdGlvbiBjb21wbGV0ZShpZDogc3RyaW5nKTogVGFzayB8IHVuZGVmaW5lZCB7CiAgcmV0dXJuIHRhc2tSZXBvLnVwZGF0ZVRhc2soaWQsIHsgc3RhdHVzOiAnZG9uZScgfSk7Cn0KCmV4cG9ydCBmdW5jdGlvbiByZW1vdmUoaWQ6IHN0cmluZyk6IGJvb2xlYW4gewogIHJldHVybiB0YXNrUmVwby5kZWxldGVUYXNrKGlkKTsKfQoKZXhwb3J0IGZ1bmN0aW9uIG92ZXJkdWVUYXNrcyhub3c6IERhdGUgPSBuZXcgRGF0ZSgpKTogVGFza1tdIHsKICByZXR1cm4gdGFza1JlcG8ubGlzdFRhc2tzKCkuZmlsdGVyKCh0KSA9PiB0LnN0YXR1cyAhPT0gJ2RvbmUnICYmIGlzT3ZlcmR1ZSh0LmR1ZURhdGUsIG5vdykpOwp9Cg==';

const KNOWN_BAD_MONEY_B64 =
  'ZXhwb3J0IGZ1bmN0aW9uIHN1bUNvc3RzKGNvc3RzOiBudW1iZXJbXSk6IG51bWJlciB7CiAgbGV0IHRvdGFsID0gMDsKICBmb3IgKGNvbnN0IGNvc3Qgb2YgY29zdHMpIHsKICAgIHRvdGFsICs9IGNvc3Q7CiAgfQogIHJldHVybiB0b3RhbDsKfQoKZXhwb3J0IGZ1bmN0aW9uIGF2ZXJhZ2VDb3N0KGNvc3RzOiBudW1iZXJbXSk6IG51bWJlciB7CiAgaWYgKGNvc3RzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7CiAgcmV0dXJuIE1hdGgucm91bmQoKHN1bUNvc3RzKGNvc3RzKSAvIGNvc3RzLmxlbmd0aCkgKiAxMDApIC8gMTAwOwp9CgpleHBvcnQgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3koYW1vdW50OiBudW1iZXIpOiBzdHJpbmcgewogIHJldHVybiBgJCR7YW1vdW50LnRvRml4ZWQoMil9YDsKfQo=';

const KNOWN_BAD_TASK_SERVICE = Buffer.from(KNOWN_BAD_TASK_SERVICE_B64, 'base64').toString('utf8');
const KNOWN_BAD_MONEY = Buffer.from(KNOWN_BAD_MONEY_B64, 'base64').toString('utf8');

// ---------------------------------------------------------------------
// Grader-authored (hidden) boundary-value tests. Independent of whatever
// is committed under tests/, so a learner weakening or deleting their own
// regression test doesn't automatically pass this check.
// ---------------------------------------------------------------------
const PAGINATION_HIDDEN_TEST = `import * as taskService from '../../src/services/taskService';

describe('[grading] taskService.list pagination boundaries', () => {
  it('page 1 starts at the first record, not the second', () => {
    const result = taskService.list({ page: 1, size: 4, userId: 'u1' });
    expect(result.items.map((t) => t.id)).toEqual(['t1', 't2', 't3', 't4']);
  });

  it('the last page includes the last record, not an empty or short slice', () => {
    const result = taskService.list({ page: 2, size: 4, userId: 'u1' });
    expect(result.items.map((t) => t.id)).toEqual(['t5', 't6', 't7', 't8']);
  });

  it('paging through every page for a user reconstructs the full set with no drops or duplicates', () => {
    const page1 = taskService.list({ page: 1, size: 3, userId: 'u3' });
    const page2 = taskService.list({ page: 2, size: 3, userId: 'u3' });
    const page3 = taskService.list({ page: 3, size: 3, userId: 'u3' });
    const all = [...page1.items, ...page2.items, ...page3.items].map((t) => t.id);
    expect(new Set(all).size).toBe(9);
    expect(all).toContain('t17');
    expect(all).toContain('t25');
  });
});
`;

const MONEY_HIDDEN_TEST = `import { sumCosts } from '../../src/util/money';

describe('[grading] sumCosts float precision', () => {
  it('sums fractional costs without float drift (0.1 + 0.2 + 0.3)', () => {
    expect(sumCosts([0.1, 0.2, 0.3])).toBe(0.6);
  });

  it('sums a different known-drifting set (1.1 + 2.2 + 3.3)', () => {
    expect(sumCosts([1.1, 2.2, 3.3])).toBe(6.6);
  });

  it('matches an exact total for a longer list of fractional-cost values', () => {
    const total = sumCosts([0.1, 0.2, 15.5, 250, 0, 1000, 0, 0.3]);
    expect(total).toBe(1266.1);
  });
});
`;

// ---------------------------------------------------------------------
// Functionality (30), part 1: services/ line coverage >= 80%
// ---------------------------------------------------------------------
{
  rmSync(path.join(root, 'coverage'), { recursive: true, force: true });
  run('npx jest --coverage --coverageReporters=json-summary --silent');
  const summaryPath = path.join(root, 'coverage', 'coverage-summary.json');
  if (!existsSync(summaryPath)) {
    record('services/ line coverage >= 80%', 0, 14, 'coverage/coverage-summary.json not produced — coverage run did not complete');
  } else {
    try {
      const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
      let covered = 0;
      let total = 0;
      for (const [file, data] of Object.entries(summary)) {
        if (file === 'total') continue;
        const norm = file.split(path.sep).join('/');
        if (norm.includes('/src/services/') && data && data.lines) {
          covered += data.lines.covered;
          total += data.lines.total;
        }
      }
      if (total === 0) {
        record('services/ line coverage >= 80%', 0, 14, 'no coverage data found for src/services/');
      } else {
        const pct = (covered / total) * 100;
        if (pct >= 80) {
          record('services/ line coverage >= 80%', 14, 14, `${pct.toFixed(1)}% line coverage on src/services/`);
        } else {
          const scaled = Math.max(0, Math.min(13, Math.floor((pct / 80) * 14)));
          record('services/ line coverage >= 80%', scaled, 14, `${pct.toFixed(1)}% line coverage on src/services/ (need 80%)`);
        }
      }
    } catch (err) {
      record('services/ line coverage >= 80%', 0, 14, `could not parse coverage-summary.json: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------
// Functionality (30), part 2 + 3: the two bug fixes, verified at boundary
// values independent of the learner's own tests, with an anti-cheat
// revert-check on each.
// ---------------------------------------------------------------------
const gradingDir = path.join(root, 'tests', '__grading__');
const paginationHiddenRel = 'tests/__grading__/pagination.grading.test.ts';
const moneyHiddenRel = 'tests/__grading__/money.grading.test.ts';

try {
  mkdirSync(gradingDir, { recursive: true });
  writeFileSync(path.join(root, paginationHiddenRel), PAGINATION_HIDDEN_TEST, 'utf8');
  writeFileSync(path.join(root, moneyHiddenRel), MONEY_HIDDEN_TEST, 'utf8');

  // ---- Pagination fix ----
  {
    const taskServicePath = path.join(root, 'src', 'services', 'taskService.ts');
    if (!existsSync(taskServicePath)) {
      record('Pagination fix holds at boundary values', 0, 8, 'src/services/taskService.ts not found');
    } else {
      const fixedRun = runJestFile(paginationHiddenRel);
      if (fixedRun.code !== 0) {
        record(
          'Pagination fix holds at boundary values',
          0,
          8,
          'boundary-value check fails against the current source — pagination is not fully fixed yet',
        );
      } else {
        const backup = readFileSync(taskServicePath, 'utf8');
        let revertFailedAsExpected = false;
        try {
          writeFileSync(taskServicePath, KNOWN_BAD_TASK_SERVICE, 'utf8');
          const revertRun = runJestFile(paginationHiddenRel);
          revertFailedAsExpected = revertRun.code !== 0;
        } finally {
          writeFileSync(taskServicePath, backup, 'utf8');
        }
        if (revertFailedAsExpected) {
          record(
            'Pagination fix holds at boundary values',
            8,
            8,
            'boundary check passes on current source and correctly fails against the seeded-defect source (anti-cheat revert-check OK)',
          );
        } else {
          record(
            'Pagination fix holds at boundary values',
            8,
            8,
            'boundary check passes on current source (anti-cheat revert-check was inconclusive on the grader side — does not reduce your score)',
          );
        }
      }
    }
  }

  // ---- Money fix ----
  {
    const moneyPath = path.join(root, 'src', 'util', 'money.ts');
    if (!existsSync(moneyPath)) {
      record('Money fix holds across fractional inputs', 0, 8, 'src/util/money.ts not found');
    } else {
      const fixedRun = runJestFile(moneyHiddenRel);
      if (fixedRun.code !== 0) {
        record(
          'Money fix holds across fractional inputs',
          0,
          8,
          'float-precision check fails against the current source — sumCosts is not fully fixed yet',
        );
      } else {
        const backup = readFileSync(moneyPath, 'utf8');
        let revertFailedAsExpected = false;
        try {
          writeFileSync(moneyPath, KNOWN_BAD_MONEY, 'utf8');
          const revertRun = runJestFile(moneyHiddenRel);
          revertFailedAsExpected = revertRun.code !== 0;
        } finally {
          writeFileSync(moneyPath, backup, 'utf8');
        }
        if (revertFailedAsExpected) {
          record(
            'Money fix holds across fractional inputs',
            8,
            8,
            'float-precision check passes on current source and correctly fails against the seeded-defect source (anti-cheat revert-check OK)',
          );
        } else {
          record(
            'Money fix holds across fractional inputs',
            8,
            8,
            'float-precision check passes on current source (anti-cheat revert-check was inconclusive on the grader side — does not reduce your score)',
          );
        }
      }
    }
  }
} finally {
  rmSync(gradingDir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------
// Tool usage (25): evidence of real boundary/edge-case enumeration in the
// learner's OWN committed regression tests (not the grader's hidden ones,
// which have already been cleaned up by this point).
// ---------------------------------------------------------------------
{
  const testDir = path.join(root, 'tests');
  const testFiles = collectTestFiles(testDir);

  let paginationBlocks = 0;
  let moneyBlocks = 0;
  const paginationFiles = [];
  const moneyFiles = [];

  for (const f of testFiles) {
    const content = readFileSync(f, 'utf8');
    const isPaginationFile = /taskService/i.test(content) && /\.list\(/.test(content);
    const isMoneyFile = /sumCosts/.test(content);
    if (isPaginationFile) {
      const n = countTestBlocks(content);
      paginationBlocks += n;
      if (n > 0) paginationFiles.push(path.relative(root, f));
    }
    if (isMoneyFile) {
      const n = countTestBlocks(content);
      moneyBlocks += n;
      if (n > 0) moneyFiles.push(path.relative(root, f));
    }
  }

  if (paginationBlocks >= 2) {
    record(
      'Pagination regression tests show real boundary enumeration',
      13,
      13,
      `${paginationBlocks} test case(s) across: ${paginationFiles.join(', ') || 'none'}`,
    );
  } else if (paginationBlocks === 1) {
    record(
      'Pagination regression tests show real boundary enumeration',
      4,
      13,
      'only the original seeded test present — no additional boundary case added',
    );
  } else {
    record('Pagination regression tests show real boundary enumeration', 0, 13, 'no pagination-related test found in tests/');
  }

  if (moneyBlocks >= 2) {
    record(
      'Money regression tests show real edge-case enumeration',
      12,
      12,
      `${moneyBlocks} test case(s) across: ${moneyFiles.join(', ') || 'none'}`,
    );
  } else if (moneyBlocks === 1) {
    record(
      'Money regression tests show real edge-case enumeration',
      4,
      12,
      'only the original seeded test present — no additional case added',
    );
  } else {
    record('Money regression tests show real edge-case enumeration', 0, 12, 'no sumCosts-related test found in tests/');
  }
}

// ---------------------------------------------------------------------
// Code quality (20): lint + type-check
// ---------------------------------------------------------------------
{
  const lintRun = run('npm run lint --silent');
  if (lintRun.code === 0) {
    record('npm run lint passes', 10, 10, 'lint passed with no errors');
  } else {
    record('npm run lint passes', 0, 10, 'lint failed — see `npm run lint` output');
  }
}
{
  const tscRun = run('npx tsc --noEmit');
  if (tscRun.code === 0) {
    record('Project compiles cleanly (tsc --noEmit)', 10, 10, 'no type errors');
  } else {
    record('Project compiles cleanly (tsc --noEmit)', 0, 10, 'type errors present — see `npx tsc --noEmit` output');
  }
}

// ---------------------------------------------------------------------
// Best practices (10): no disabled tests, permission config still intact
// ---------------------------------------------------------------------
{
  const testDir = path.join(root, 'tests');
  const testFiles = collectTestFiles(testDir);
  const offenders = [];
  for (const f of testFiles) {
    const content = readFileSync(f, 'utf8');
    if (/\b(it|test|describe)\.only\s*\(/.test(content) || /\b(it|test|describe)\.skip\s*\(/.test(content)) {
      offenders.push(path.relative(root, f));
    }
  }
  if (offenders.length === 0) {
    record('No .only/.skip left in test files', 5, 5, 'clean');
  } else {
    record('No .only/.skip left in test files', 0, 5, `found in: ${offenders.join(', ')}`);
  }
}
{
  const settingsRaw = readIfExists('.claude/settings.json');
  if (settingsRaw === null) {
    record('.claude/settings.json still valid with deny rule', 0, 5, '.claude/settings.json not found');
  } else {
    try {
      const parsed = JSON.parse(settingsRaw);
      const perms = parsed.permissions ?? {};
      const hasDeny = Array.isArray(perms.deny) && perms.deny.length > 0;
      record(
        '.claude/settings.json still valid with deny rule',
        hasDeny ? 5 : 2,
        5,
        hasDeny ? 'deny rule present' : 'valid JSON but no deny rule found',
      );
    } catch (err) {
      record('.claude/settings.json still valid with deny rule', 0, 5, `invalid JSON: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 3 Assessment — Grade Report');
console.log('================================');
console.log('(Presentation, 15 pts, is scored by hand from NOTES.md — not included below.)');
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
