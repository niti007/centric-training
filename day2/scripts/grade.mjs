#!/usr/bin/env node
// Day 2 deterministic grader.
//
// Inspects files on disk and runs tests/lint/compile only — never reads
// chat logs or transcripts. Run as: node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md Assessment note and is NOT included in this script's
// total; that is printed as a reminder, not a score.
//
// Validated to score low and exit non-zero against Day 2's unmodified
// starting state (reportBuilder.ts still one function, no extractions,
// no new tests). If it doesn't, the grader is broken — don't trust its score.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
    execSync(cmd, { cwd: root, stdio: 'pipe' });
    return { ok: true, status: 0 };
  } catch (err) {
    return { ok: false, status: err.status ?? 'unknown' };
  }
}

// ---------------------------------------------------------------------
// Heuristic: find top-level named functions in a TS source file and
// their line counts, via brace-depth matching (quote-aware, not a real
// parser — good enough to catch "was this actually decomposed").
//
// Function-declaration params can contain inline object-type annotations
// (e.g. `function f(opts: { x: number }): string {`), which have their own
// `{`/`}`. We must walk past the closing `)` of the param list — tracking
// paren depth, not just scanning for the first `{` — before looking for the
// body's opening brace, or that param-type brace gets mistaken for the body.
// ---------------------------------------------------------------------
function findTopLevelFunctions(src) {
  const lineStarts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\n') lineStarts.push(i + 1);
  }
  function lineOf(idx) {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }

  function skipString(j) {
    const q = src[j];
    j++;
    while (j < src.length) {
      if (src[j] === '\\') { j += 2; continue; }
      if (src[j] === q) return j + 1;
      j++;
    }
    return j;
  }

  function findMatchingParenEnd(openParenIdx) {
    let depth = 0;
    for (let j = openParenIdx; j < src.length; j++) {
      const ch = src[j];
      if (ch === '"' || ch === "'" || ch === '`') { j = skipString(j) - 1; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return j + 1;
      }
    }
    return -1;
  }

  function findBodyBrace(fromIdx) {
    let inStr = null;
    for (let j = fromIdx; j < src.length; j++) {
      const ch = src[j];
      if (inStr) {
        if (ch === '\\') { j++; continue; }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '{') return j;
    }
    return -1;
  }

  function findBraceEnd(braceStart) {
    let depth = 0;
    let inStr = null;
    for (let j = braceStart; j < src.length; j++) {
      const ch = src[j];
      if (inStr) {
        if (ch === '\\') { j++; continue; }
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return j;
      }
    }
    return -1;
  }

  const found = [];

  // Function declarations: skip past the matching `)` of the param list
  // (paren-depth-aware) before hunting for the body's opening `{`.
  {
    const re = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
    let m;
    while ((m = re.exec(src))) {
      const openParenIdx = re.lastIndex - 1;
      const afterParams = findMatchingParenEnd(openParenIdx);
      if (afterParams === -1) continue;
      const braceStart = findBodyBrace(afterParams);
      if (braceStart === -1) continue;
      const end = findBraceEnd(braceStart);
      if (end === -1) continue;
      found.push({ name: m[1], loc: lineOf(end) - lineOf(m.index) + 1, index: m.index });
    }
  }

  // Arrow functions assigned to a const: the regex already matches through
  // the body's opening `{`, so no param-skipping is needed here.
  {
    const re = /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::\s*[^=]+)?=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?=>\s*\{/g;
    let m;
    while ((m = re.exec(src))) {
      const braceStart = re.lastIndex - 1;
      const end = findBraceEnd(braceStart);
      if (end === -1) continue;
      found.push({ name: m[1], loc: lineOf(end) - lineOf(m.index) + 1, index: m.index });
    }
  }

  const seen = new Set();
  const dedup = [];
  for (const f of found.sort((a, b) => a.index - b.index)) {
    if (seen.has(f.name)) continue;
    seen.add(f.name);
    dedup.push(f);
  }
  return dedup;
}

const reportBuilderSrc = readIfExists('src/legacy/reportBuilder.ts') ?? '';
const functions = findTopLevelFunctions(reportBuilderSrc);
const buildReportFn = functions.find((f) => f.name === 'buildReport');
const otherFns = functions.filter((f) => f.name !== 'buildReport');
const qualifyingFns = otherFns.filter((f) => f.loc < 60);

// ---------------------------------------------------------------------
// Functionality (30)
// ---------------------------------------------------------------------
{
  if (buildReportFn) {
    record('buildReport still exported from reportBuilder.ts', 5, 5, `found, ${buildReportFn.loc} lines`);
  } else {
    record('buildReport still exported from reportBuilder.ts', 0, 5, 'no top-level buildReport function found');
  }
}
{
  const count = Math.min(qualifyingFns.length, 3);
  const names = qualifyingFns.map((f) => `${f.name} (${f.loc} lines)`).join(', ') || 'none';
  const overSize = otherFns.filter((f) => f.loc >= 60);
  const overNote = overSize.length > 0 ? `; ${overSize.length} extracted function(s) at/over 60 lines: ${overSize.map((f) => f.name).join(', ')}` : '';
  record(
    '>=3 units extracted from reportBuilder, each <60 lines',
    count * 5,
    15,
    `${qualifyingFns.length} qualifying unit(s) found: ${names}${overNote}`,
  );
}
{
  if (reportBuilderSrc === '') {
    record('characterization tests pass, snapshots unchanged', 0, 10, 'src/legacy/reportBuilder.ts not found');
  } else {
    const testResult = run('npx jest reportBuilder.characterization --silent');
    record(
      'characterization tests pass, snapshots unchanged',
      testResult.ok ? 10 : 0,
      10,
      testResult.ok ? 'tests/reportBuilder.characterization.test.ts passed with no snapshot diff' : `jest exited ${testResult.status} — see \`npx jest reportBuilder.characterization\` output`,
    );
  }
}

// ---------------------------------------------------------------------
// Tool usage (25)
// ---------------------------------------------------------------------
{
  const testDir = path.join(root, 'tests');
  let newTestFiles = [];
  if (existsSync(testDir)) {
    const files = readdirSync(testDir).filter((f) => f.endsWith('.test.ts') && f !== 'reportBuilder.characterization.test.ts');
    for (const f of files) {
      const content = readFileSync(path.join(testDir, f), 'utf8');
      if (/legacy\/reportBuilder/.test(content)) {
        newTestFiles.push(f);
      }
    }
  }
  if (newTestFiles.length === 0) {
    record('new unit test(s) for extracted unit(s) exist and pass', 0, 10, 'no test file (other than the characterization test) imports from src/legacy/reportBuilder');
  } else {
    const cmd = `npx jest ${newTestFiles.map((f) => `tests/${f}`).join(' ')} --silent`;
    const testResult = run(cmd);
    record(
      'new unit test(s) for extracted unit(s) exist and pass',
      testResult.ok ? 10 : 3,
      10,
      testResult.ok
        ? `found and passed: ${newTestFiles.join(', ')}`
        : `found ${newTestFiles.join(', ')} but jest exited ${testResult.status}`,
    );
  }
}
{
  const notes = readIfExists('NOTES.md') ?? '';
  const idx = notes.indexOf('## Assessment');
  if (idx === -1) {
    record('NOTES.md has a substantive ## Assessment note', 0, 10, 'no "## Assessment" heading found in NOTES.md');
  } else {
    const nextHeadingIdx = notes.indexOf('\n## ', idx + 1);
    const section = nextHeadingIdx === -1 ? notes.slice(idx) : notes.slice(idx, nextHeadingIdx);
    const nonBlankLines = section.split('\n').filter((l) => l.trim().length > 0 && !l.trim().startsWith('##'));
    if (nonBlankLines.length >= 4) {
      record('NOTES.md has a substantive ## Assessment note', 10, 10, `${nonBlankLines.length} non-blank content lines under ## Assessment`);
    } else if (nonBlankLines.length > 0) {
      record('NOTES.md has a substantive ## Assessment note', 4, 10, `only ${nonBlankLines.length} non-blank line(s) — looks thin`);
    } else {
      record('NOTES.md has a substantive ## Assessment note', 0, 10, '## Assessment heading present but section is empty');
    }
  }
}
{
  const lintResult = run('npm run lint');
  record('npm run lint passes', lintResult.ok ? 5 : 0, 5, lintResult.ok ? 'lint passed' : `lint failed, exited ${lintResult.status}`);
}

// ---------------------------------------------------------------------
// Code quality (20)
// ---------------------------------------------------------------------
{
  if (buildReportFn) {
    if (buildReportFn.loc <= 100) {
      record('buildReport orchestrates rather than still doing the work', 10, 10, `${buildReportFn.loc} lines (down from ~275 in the starting state)`);
    } else if (buildReportFn.loc <= 180) {
      record('buildReport orchestrates rather than still doing the work', 5, 10, `${buildReportFn.loc} lines — some extraction happened but buildReport is still doing most of the work`);
    } else {
      record('buildReport orchestrates rather than still doing the work', 0, 10, `${buildReportFn.loc} lines — little or no real decomposition`);
    }
  } else {
    record('buildReport orchestrates rather than still doing the work', 0, 10, 'buildReport not found');
  }
}
{
  const buildResult = run('npx tsc --noEmit -p tsconfig.json');
  record('TypeScript compiles cleanly', buildResult.ok ? 10 : 0, 10, buildResult.ok ? 'tsc --noEmit exited 0' : `tsc --noEmit exited ${buildResult.status}`);
}

// ---------------------------------------------------------------------
// Best practices (10): no new dependencies added vs. Day 2's baseline
// ---------------------------------------------------------------------
{
  const baselineDeps = ['express'];
  const baselineDevDeps = [
    '@eslint/js',
    '@types/express',
    '@types/jest',
    '@types/node',
    '@types/supertest',
    'eslint',
    'jest',
    'supertest',
    'ts-jest',
    'ts-node',
    'typescript',
    'typescript-eslint',
  ];
  const pkgRaw = readIfExists('package.json');
  if (pkgRaw === null) {
    record('no new dependencies added', 0, 10, 'package.json not found');
  } else {
    let pkg;
    try {
      pkg = JSON.parse(pkgRaw);
    } catch (err) {
      pkg = null;
      record('no new dependencies added', 0, 10, `package.json invalid JSON: ${err.message}`);
    }
    if (pkg) {
      const currentDeps = Object.keys(pkg.dependencies ?? {});
      const currentDevDeps = Object.keys(pkg.devDependencies ?? {});
      const newDeps = currentDeps.filter((d) => !baselineDeps.includes(d));
      const newDevDeps = currentDevDeps.filter((d) => !baselineDevDeps.includes(d));
      if (newDeps.length === 0 && newDevDeps.length === 0) {
        record('no new dependencies added', 10, 10, 'dependencies and devDependencies unchanged from baseline');
      } else {
        const detail = [
          newDeps.length ? `new runtime dep(s): ${newDeps.join(', ')}` : null,
          newDevDeps.length ? `new dev dep(s): ${newDevDeps.join(', ')}` : null,
        ].filter(Boolean).join('; ');
        record('no new dependencies added', newDeps.length > 0 ? 0 : 3, 10, detail);
      }
    }
  }
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 2 Assessment — Grade Report');
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
