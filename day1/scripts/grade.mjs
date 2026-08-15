#!/usr/bin/env node
// Day 1 deterministic grader.
//
// Inspects files on disk only — never reads chat logs or transcripts.
// Run as: node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md and is NOT included in this script's total; that is
// printed as a reminder, not a score.

import { existsSync, readFileSync } from 'node:fs';
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

// ---------------------------------------------------------------------
// Best practices (10): CLAUDE.md required sections
// ---------------------------------------------------------------------
{
  const claudeMd = readIfExists('CLAUDE.md');
  const requiredSections = ['## Commands', '## Architecture', '## Conventions', '## Do Not Touch'];
  if (claudeMd === null) {
    record('CLAUDE.md exists with required sections', 0, 6, 'CLAUDE.md not found at repo root');
  } else {
    const missing = requiredSections.filter((s) => !claudeMd.includes(s));
    if (missing.length === 0) {
      record('CLAUDE.md exists with required sections', 6, 6, 'all four required sections present');
    } else {
      record(
        'CLAUDE.md exists with required sections',
        Math.max(0, 6 - missing.length * 2),
        6,
        `missing section(s): ${missing.join(', ')}`,
      );
    }
  }
}

// ---------------------------------------------------------------------
// Best practices (10, cont.): .claude/settings.json has deny + ask rules
// ---------------------------------------------------------------------
{
  const settingsRaw = readIfExists('.claude/settings.json');
  if (settingsRaw === null) {
    record('.claude/settings.json valid with deny + ask rules', 0, 4, '.claude/settings.json not found');
  } else {
    let parsed;
    try {
      parsed = JSON.parse(settingsRaw);
    } catch (err) {
      record('.claude/settings.json valid with deny + ask rules', 0, 4, `invalid JSON: ${err.message}`);
      parsed = null;
    }
    if (parsed) {
      const perms = parsed.permissions ?? {};
      const hasDeny = Array.isArray(perms.deny) && perms.deny.length > 0;
      const hasAsk = Array.isArray(perms.ask) && perms.ask.length > 0;
      if (hasDeny && hasAsk) {
        record('.claude/settings.json valid with deny + ask rules', 4, 4, 'deny and ask rules both present');
      } else {
        const missing = [!hasDeny && 'deny', !hasAsk && 'ask'].filter(Boolean).join(', ');
        record('.claude/settings.json valid with deny + ask rules', hasDeny || hasAsk ? 2 : 0, 4, `missing rule type(s): ${missing}`);
      }
    }
  }
}

// ---------------------------------------------------------------------
// Functionality (30, part): verify-setup.mjs exits 0
// ---------------------------------------------------------------------
{
  try {
    execSync('node scripts/verify-setup.mjs', { cwd: root, stdio: 'pipe' });
    record('verify-setup.mjs exits 0', 10, 10, 'exited 0');
  } catch (err) {
    const status = err.status ?? 'unknown';
    record('verify-setup.mjs exits 0', 0, 10, `exited ${status}`);
  }
}

// ---------------------------------------------------------------------
// Functionality (30, part) + Code quality (20, part): DELETE /tasks/:id route
// ---------------------------------------------------------------------
{
  const routeFile = readIfExists('src/routes/tasks.ts');
  if (routeFile === null) {
    record('DELETE /tasks/:id route exists', 0, 12, 'src/routes/tasks.ts not found');
    record('Route imports util/validate and avoids src/repo/', 0, 20, 'src/routes/tasks.ts not found');
  } else {
    const deleteRouteMatch = routeFile.match(
      /router\.delete\(\s*['"`]\/:id['"`][\s\S]*?(?=router\.\w+\(|export default)/,
    );
    if (!deleteRouteMatch) {
      record('DELETE /tasks/:id route exists', 0, 12, 'no router.delete("/:id", ...) handler found');
      record('Route imports util/validate and avoids src/repo/', 0, 20, 'no DELETE handler to check');
    } else {
      record('DELETE /tasks/:id route exists', 12, 12, 'router.delete("/:id", ...) handler found');

      const importsValidate = /from\s+['"]\.\.\/util\/validate['"]/.test(routeFile);
      const importsRepo = /from\s+['"]\.\.\/repo\//.test(routeFile);
      const usesErrorEnvelope = /errorEnvelope\(/.test(deleteRouteMatch[0]);

      let qualityPoints = 0;
      const notes = [];
      if (importsValidate) {
        qualityPoints += 8;
        notes.push('imports util/validate: yes');
      } else {
        notes.push('imports util/validate: no');
      }
      if (!importsRepo) {
        qualityPoints += 8;
        notes.push('imports src/repo/ directly: no');
      } else {
        notes.push('imports src/repo/ directly: yes (violation)');
      }
      if (usesErrorEnvelope) {
        qualityPoints += 4;
        notes.push('DELETE handler uses errorEnvelope: yes');
      } else {
        notes.push('DELETE handler uses errorEnvelope: no');
      }
      record('Route imports util/validate and avoids src/repo/', qualityPoints, 20, notes.join('; '));
    }
  }
}

// ---------------------------------------------------------------------
// Functionality (30, part): sibling test references DELETE /tasks/
// ---------------------------------------------------------------------
{
  const testDir = path.join(root, 'tests');
  let found = false;
  let checkedFiles = [];
  if (existsSync(testDir)) {
    const fs = await import('node:fs');
    const files = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.ts'));
    checkedFiles = files;
    for (const f of files) {
      const content = readFileSync(path.join(testDir, f), 'utf8');
      if (/DELETE\s*['"`]?\s*\/tasks\//i.test(content) || /\.delete\(\s*['"`]\/tasks\//.test(content)) {
        found = true;
        break;
      }
    }
  }
  record(
    'Sibling test references DELETE /tasks/',
    found ? 8 : 0,
    8,
    found ? 'found a test referencing DELETE /tasks/' : `no match in ${checkedFiles.length} test file(s)`,
  );
}

// ---------------------------------------------------------------------
// Tool usage (25): lint passes (proxy for headless command having been
// run cleanly rather than hand-patched into a broken state)
// ---------------------------------------------------------------------
{
  try {
    execSync('npm run lint', { cwd: root, stdio: 'pipe' });
    record('npm run lint passes', 15, 15, 'lint passed');
  } catch (err) {
    record('npm run lint passes', 0, 15, 'lint failed — see `npm run lint` output');
  }
}

// ---------------------------------------------------------------------
// Tool usage (25, cont.): CLAUDE.md is present and non-trivial in length
// (a crude proxy for "was actually authored", not copy-pasted empty)
// ---------------------------------------------------------------------
{
  const claudeMd = readIfExists('CLAUDE.md') ?? '';
  const lineCount = claudeMd.split('\n').filter((l) => l.trim().length > 0).length;
  if (lineCount >= 15) {
    record('CLAUDE.md has substantive content', 10, 10, `${lineCount} non-blank lines`);
  } else if (lineCount > 0) {
    record('CLAUDE.md has substantive content', 4, 10, `only ${lineCount} non-blank lines — looks like a stub`);
  } else {
    record('CLAUDE.md has substantive content', 0, 10, 'CLAUDE.md empty or missing');
  }
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 1 Assessment — Grade Report');
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
