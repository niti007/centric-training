#!/usr/bin/env node
// Day 4 deterministic grader.
//
// Inspects files on disk only — never reads chat logs or transcripts, and
// never invokes Claude Code itself. `.claude/commands/qa-report.md` is a
// slash-command *prompt* file, not an executable script, so this grader
// cannot literally "run" /qa-report and check its output. Instead it checks
// proxies: does the command's frontmatter and body reference real repo
// commands (npm test / npm run lint / npm run build) and specify a fixed
// report schema, and does the skill's description read as something that
// would actually trigger on a real request rather than a vague placeholder.
// The learner's own NOTES.md entries (a real, pasted /qa-report run and a
// real auto-activation test transcript) are the check for "did this
// actually work when invoked" that the script itself cannot perform.
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md Assessment note and is NOT included in this script's
// total; that is printed as a reminder, not a score.
//
// Validated to score zero on Functionality and Tool usage and exit
// non-zero against Day 4's unmodified starting state (no
// .claude/commands/qa-report.md, no .claude/skills/api-endpoint/SKILL.md).
// If it doesn't, the grader is broken — don't trust its score.
//
// Run as: node scripts/grade.mjs

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
// Minimal frontmatter parser: not a real YAML parser, just enough to pull
// `key: value` pairs (with simple line-wrapped continuations) out of a
// `---`-delimited block, which is all a command/skill frontmatter needs.
// ---------------------------------------------------------------------
function parseFrontmatter(raw) {
  if (raw === null) {
    return { ok: false, frontmatter: {}, body: '', error: 'file not found' };
  }
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { ok: false, frontmatter: {}, body: raw, error: 'no frontmatter block found (missing --- delimiters)' };
  }
  const [, fmBlock, body] = match;
  const frontmatter = {};
  let lastKey = null;
  for (const line of fmBlock.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/);
    if (kv) {
      lastKey = kv[1];
      frontmatter[lastKey] = kv[2].replace(/^['"]|['"]$/g, '').trim();
    } else if (lastKey && line.trim().length > 0) {
      frontmatter[lastKey] = `${frontmatter[lastKey]} ${line.trim()}`.trim();
    }
  }
  return { ok: true, frontmatter, body, error: null };
}

const VAGUE_DESCRIPTION_PATTERNS = [
  /^helps?\s+with/i,
  /^assists?\s+with/i,
  /related\s+tasks?\.?$/i,
  /api[- ]related/i,
  /does\s+(some|various|stuff)/i,
  /^runs?\s+(checks?|qa)\.?$/i,
  /^qa\s+command\.?$/i,
  /^(a\s+)?(useful|helpful|handy)\s+(command|skill)/i,
];

function scoreDescription(desc, maxPoints) {
  const tierFull = maxPoints;
  const tierPartial = Math.round(maxPoints / 2);
  if (!desc || desc.trim().length === 0) {
    return { points: 0, detail: 'no description field' };
  }
  const trimmed = desc.trim();
  if (trimmed.length < 15) {
    return { points: 0, detail: `description too short to be meaningful: "${trimmed}"` };
  }
  const vague = VAGUE_DESCRIPTION_PATTERNS.some((re) => re.test(trimmed));
  if (trimmed.length < 30 || vague) {
    return { points: tierPartial, detail: `description present but generic/thin: "${trimmed}"` };
  }
  return { points: tierFull, detail: `description: "${trimmed}"` };
}

function extractSection(md, heading) {
  const idx = md.indexOf(heading);
  if (idx === -1) return null;
  const nextHeadingIdx = md.indexOf('\n## ', idx + heading.length);
  return nextHeadingIdx === -1 ? md.slice(idx) : md.slice(idx, nextHeadingIdx);
}

function nonBlankContentLines(section) {
  return section
    .split('\n')
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('##'));
}

// =======================================================================
// Load the two graded artifacts.
// =======================================================================
const qaReportRaw = readIfExists('.claude/commands/qa-report.md');
const qaReport = parseFrontmatter(qaReportRaw);

const skillRaw = readIfExists('.claude/skills/api-endpoint/SKILL.md');
const skill = parseFrontmatter(skillRaw);

const notes = readIfExists('NOTES.md') ?? '';

// =======================================================================
// Functionality (30)
// =======================================================================
{
  if (qaReportRaw === null) {
    record('.claude/commands/qa-report.md exists with valid frontmatter', 0, 4, 'file not found');
  } else if (!qaReport.ok) {
    record('.claude/commands/qa-report.md exists with valid frontmatter', 1, 4, qaReport.error);
  } else {
    record('.claude/commands/qa-report.md exists with valid frontmatter', 4, 4, 'file found, frontmatter block parses');
  }
}
{
  const { points, detail } = scoreDescription(qaReport.frontmatter.description, 6);
  record('qa-report.md description is specific, not generic', points, 6, detail);
}
{
  const body = qaReport.body ?? '';
  const cmdChecks = [
    { label: 'npm test', re: /npm\s+(run\s+)?test\b/i },
    { label: 'npm run lint', re: /npm\s+run\s+lint\b/i },
    { label: 'npm run build', re: /npm\s+run\s+build\b/i },
  ];
  const hits = cmdChecks.filter((c) => c.re.test(body));
  record(
    'qa-report.md references real repo commands',
    hits.length * 2,
    6,
    hits.length > 0
      ? `references: ${hits.map((h) => h.label).join(', ')}`
      : 'no reference to npm test / npm run lint / npm run build found in the command body',
  );
}
{
  const body = qaReport.body ?? '';
  const markers = ['lint', 'build', 'test', 'overall'];
  const found = markers.filter((m) => new RegExp(`\\b${m}\\b`, 'i').test(body));
  let points;
  if (found.length >= 4) points = 4;
  else if (found.length === 3) points = 3;
  else if (found.length === 2) points = 1;
  else points = 0;
  record(
    'qa-report.md specifies a fixed report schema',
    points,
    4,
    found.length > 0 ? `schema markers found: ${found.join(', ')}` : 'no lint/build/test/overall structure found in the body',
  );
}
{
  if (skillRaw === null) {
    record('.claude/skills/api-endpoint/SKILL.md exists with name + description', 0, 5, 'file not found');
  } else if (!skill.ok) {
    record('.claude/skills/api-endpoint/SKILL.md exists with name + description', 1, 5, skill.error);
  } else if (!skill.frontmatter.name || !skill.frontmatter.description) {
    const missing = [!skill.frontmatter.name && 'name', !skill.frontmatter.description && 'description'].filter(Boolean).join(', ');
    record('.claude/skills/api-endpoint/SKILL.md exists with name + description', 2, 5, `frontmatter parses but missing: ${missing}`);
  } else {
    record('.claude/skills/api-endpoint/SKILL.md exists with name + description', 5, 5, `name: "${skill.frontmatter.name}"`);
  }
}
{
  const { points, detail } = scoreDescription(skill.frontmatter.description, 5);
  record('SKILL.md description is specific, not generic', points, 5, detail);
}

// =======================================================================
// Tool usage (25)
// =======================================================================
{
  const desc = skill.frontmatter.description ?? '';
  const hasAction = /\b(add|create|scaffold|adding|creating|scaffolding)\b/i.test(desc);
  const hasNoun = /\b(endpoint|route)\b/i.test(desc);
  const hasTrigger = /\buse when\b/i.test(desc) || /\bwhen\s+(asked|adding|creating|scaffolding)\b/i.test(desc);
  const points = (hasAction ? 3 : 0) + (hasNoun ? 3 : 0) + (hasTrigger ? 4 : 0);
  const missing = [!hasAction && 'an action verb (add/create/scaffold)', !hasNoun && 'the noun endpoint/route', !hasTrigger && 'an explicit trigger phrase ("Use when...")'].filter(Boolean);
  record(
    "SKILL.md description is written to trigger reliably",
    points,
    10,
    missing.length === 0 ? 'names a concrete action, a concrete noun, and an explicit trigger phrase' : `missing: ${missing.join('; ')}`,
  );
}
{
  const section = extractSection(notes, '## Skill Auto-Activation Test');
  if (section === null) {
    record('NOTES.md documents a real auto-activation test', 0, 10, 'no "## Skill Auto-Activation Test" heading found in NOTES.md');
  } else {
    const lines = nonBlankContentLines(section);
    const namesSkillExplicitly = /\bapi-endpoint\s+skill\b/i.test(section) || /\buse\s+the\s+skill\b/i.test(section);
    if (lines.length >= 3 && !namesSkillExplicitly) {
      record('NOTES.md documents a real auto-activation test', 10, 10, `${lines.length} non-blank content lines, prompt does not appear to name the skill directly`);
    } else if (lines.length >= 3 && namesSkillExplicitly) {
      record('NOTES.md documents a real auto-activation test', 4, 10, 'section present but appears to name the skill/its file directly — that is not a real auto-activation test');
    } else if (lines.length > 0) {
      record('NOTES.md documents a real auto-activation test', 3, 10, `only ${lines.length} non-blank line(s) — looks thin`);
    } else {
      record('NOTES.md documents a real auto-activation test', 0, 10, 'heading present but section is empty');
    }
  }
}
{
  const section = extractSection(notes, '## QA Report Run');
  if (section === null) {
    record('NOTES.md has a real, pasted /qa-report run', 0, 5, 'no "## QA Report Run" heading found in NOTES.md');
  } else {
    const lines = nonBlankContentLines(section);
    const markers = ['lint', 'build', 'test', 'overall', 'green', 'red'];
    const found = markers.filter((m) => new RegExp(`\\b${m}\\b`, 'i').test(section));
    if (lines.length >= 3 && found.length >= 2) {
      record('NOTES.md has a real, pasted /qa-report run', 5, 5, `${lines.length} content lines, includes: ${found.join(', ')}`);
    } else if (lines.length > 0) {
      record('NOTES.md has a real, pasted /qa-report run', 2, 5, `section present but thin or missing report-shaped content (found: ${found.join(', ') || 'none'})`);
    } else {
      record('NOTES.md has a real, pasted /qa-report run', 0, 5, 'heading present but section is empty');
    }
  }
}

// =======================================================================
// Code quality (20): does SKILL.md actually encode this repo's real
// endpoint-adding convention, or is it generic advice that could apply to
// any codebase unchanged?
// =======================================================================
{
  const body = skill.body ?? '';
  const groups = [
    { label: 'validation via util/validate.ts', re: /util\/validate|validate\.ts|requireString|requireNumber|requireISODate/i },
    { label: 'delegates to a service, not repo/ directly', re: /\bservice\b|services\//i },
    { label: 'ownership check (userId)', re: /ownership|userId/i },
    { label: 'error envelope shape', re: /error envelope|error\.code|\{\s*error:/i },
    { label: 'sibling test under tests/', re: /sibling test|tests\//i },
  ];
  const hits = groups.filter((g) => g.re.test(body));
  const missing = groups.filter((g) => !g.re.test(body)).map((g) => g.label);
  record(
    'SKILL.md encodes this repo\'s real endpoint convention (not generic advice)',
    hits.length * 4,
    20,
    hits.length === groups.length
      ? 'covers validation, service delegation, ownership checks, the error envelope, and sibling tests'
      : `covers: ${hits.map((h) => h.label).join(', ') || 'none'}${missing.length ? `; missing: ${missing.join(', ')}` : ''}`,
  );
}

// =======================================================================
// Best practices (10)
// =======================================================================
{
  const allowedTools = qaReport.frontmatter['allowed-tools'];
  if (!allowedTools) {
    const bodyRequestsWrite = /\b(write|edit|modify|create)\s+(the\s+)?file/i.test(qaReport.body ?? '');
    record(
      'qa-report.md does not request unscoped write access',
      bodyRequestsWrite ? 2 : 3,
      5,
      bodyRequestsWrite
        ? 'no allowed-tools set, and the body reads as if it edits files — a report-only command should not need to'
        : 'no allowed-tools field set; cannot confirm scoping, but the body does not ask to edit anything either',
    );
  } else {
    const isUnscoped = /^\s*(Bash|Write)\s*$/i.test(allowedTools.trim()) || /(^|,)\s*Bash\s*(,|$)/i.test(allowedTools) || /(^|,)\s*Write\s*(,|$)/i.test(allowedTools);
    record(
      'qa-report.md does not request unscoped write access',
      isUnscoped ? 0 : 5,
      5,
      isUnscoped ? `allowed-tools grants unscoped Bash/Write: "${allowedTools}"` : `allowed-tools: "${allowedTools}"`,
    );
  }
}
{
  const secretPatterns = [
    /sk-[A-Za-z0-9]{16,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  ];
  const claudeDir = path.join(root, '.claude');
  const filesToScan = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const p = path.join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else filesToScan.push(p);
    }
  }
  walk(claudeDir);
  const offenders = [];
  for (const f of filesToScan) {
    let content;
    try {
      content = readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    if (secretPatterns.some((re) => re.test(content))) {
      offenders.push(path.relative(root, f));
    }
  }
  record(
    'no secret-shaped strings committed under .claude/',
    offenders.length === 0 ? 5 : 0,
    5,
    offenders.length === 0 ? 'no secret-shaped strings found' : `possible secret-shaped string in: ${offenders.join(', ')}`,
  );
}

// =======================================================================
// Print report
// =======================================================================
console.log('');
console.log('Day 4 Assessment — Grade Report');
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
