#!/usr/bin/env node
// Day 5 deterministic grader.
//
// Inspects files on disk and dynamically invokes the learner's own hook
// scripts with fabricated stdin JSON matching Claude Code's real hook input
// contract — it never reads chat logs or transcripts. Run as:
//   node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md Assessment note and is NOT included in this script's
// total; that is printed as a reminder, not a score.
//
// Validated to score at/near zero and exit non-zero against Day 5's
// unmodified starting state (no .claude/hooks/, no .github/workflows/). If
// it doesn't, the grader is broken — don't trust its score.

import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1');
const require_ = createRequire(import.meta.url);

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

// Run a hook command (exactly the string from settings.json, e.g.
// "node .claude/hooks/lint-on-write.mjs") with fabricated JSON on stdin,
// the same way Claude Code itself invokes a hook.
function runHookCommand(command, stdinObj, timeoutMs = 15000) {
  const result = spawnSync(command, {
    shell: true,
    cwd: root,
    input: typeof stdinObj === 'string' ? stdinObj : JSON.stringify(stdinObj),
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  return result;
}

// ---------------------------------------------------------------------
// Load .claude/settings.json and .claude/hooks/*.mjs up front.
// ---------------------------------------------------------------------
const settingsRaw = readIfExists('.claude/settings.json');
let settings = null;
let settingsParseError = null;
if (settingsRaw !== null) {
  try {
    settings = JSON.parse(settingsRaw);
  } catch (err) {
    settingsParseError = err.message;
  }
}

const hooksDir = path.join(root, '.claude/hooks');
const hookFiles = existsSync(hooksDir)
  ? readdirSync(hooksDir).filter((f) => f.endsWith('.mjs'))
  : [];

function firstHookCommand(eventArr) {
  if (!Array.isArray(eventArr)) return null;
  for (const entry of eventArr) {
    if (Array.isArray(entry?.hooks)) {
      for (const h of entry.hooks) {
        if (h?.type === 'command' && typeof h.command === 'string' && h.command.trim()) {
          return { command: h.command, matcher: entry.matcher ?? null };
        }
      }
    }
  }
  return null;
}

const postToolUse = settings ? firstHookCommand(settings.hooks?.PostToolUse) : null;
const preToolUse = settings ? firstHookCommand(settings.hooks?.PreToolUse) : null;
const stopHook = settings ? firstHookCommand(settings.hooks?.Stop) : null;

// ===========================================================================
// Functionality (30)
// ===========================================================================

// -- Hook files exist and are syntactically valid Node (node --check) -- (6)
{
  const expectedRoles = ['PostToolUse hook (lint-on-write)', 'PreToolUse hook (secret-block)', 'Stop hook (notify)'];
  const wired = [postToolUse, preToolUse, stopHook];
  let pts = 0;
  const details = [];
  for (let i = 0; i < 3; i++) {
    const w = wired[i];
    if (!w) {
      details.push(`${expectedRoles[i]}: not wired in settings.json`);
      continue;
    }
    const m = w.command.match(/([^\s"']+\.mjs)/);
    const scriptRel = m ? m[1] : null;
    const scriptAbs = scriptRel ? path.join(root, scriptRel) : null;
    if (!scriptRel || !existsSync(scriptAbs)) {
      details.push(`${expectedRoles[i]}: command "${w.command}" does not point at an existing .mjs file`);
      continue;
    }
    const check = spawnSync(process.execPath, ['--check', scriptAbs], { encoding: 'utf8' });
    if (check.status === 0) {
      pts += 2;
      details.push(`${expectedRoles[i]}: ${scriptRel} — valid syntax`);
    } else {
      details.push(`${expectedRoles[i]}: ${scriptRel} — node --check failed: ${(check.stderr || '').split('\n')[0]}`);
    }
  }
  if (hookFiles.length === 0) details.push('.claude/hooks/ is empty or missing');
  record('Hook files exist, wired in settings.json, valid syntax', pts, 6, details.join('; '));
}

// -- Lint hook: blocks (exit 2) on a crafted lint violation -- (6)
const scratchTs = 'src/__grade_scratch__.ts';
const scratchAbs = path.join(root, scratchTs);
const violatingSrc = 'export function bad(): number {\n  debugger;\n  return 1;\n}\n';
const cleanSrc = 'export function good(): number {\n  return 1;\n}\n';

function withScratchFile(content, fn) {
  writeFileSync(scratchAbs, content, 'utf8');
  try {
    return fn();
  } finally {
    if (existsSync(scratchAbs)) unlinkSync(scratchAbs);
  }
}

{
  if (!postToolUse) {
    record('Lint hook blocks a crafted lint violation (exit 2)', 0, 6, 'no PostToolUse hook wired');
  } else {
    const res = withScratchFile(violatingSrc, () =>
      runHookCommand(postToolUse.command, { tool_name: 'Write', tool_input: { file_path: scratchTs, content: violatingSrc } }));
    if (res.status === 2) {
      record('Lint hook blocks a crafted lint violation (exit 2)', 6, 6, `exited 2 as expected on a debugger; statement (no-debugger is error-level)`);
    } else {
      record('Lint hook blocks a crafted lint violation (exit 2)', 0, 6, `expected exit 2, got ${res.status ?? res.error?.message ?? 'unknown'}`);
    }
  }
}

// -- Lint hook: passes (exit 0) on clean input -- (4)
{
  if (!postToolUse) {
    record('Lint hook passes clean input (exit 0)', 0, 4, 'no PostToolUse hook wired');
  } else {
    const res = withScratchFile(cleanSrc, () =>
      runHookCommand(postToolUse.command, { tool_name: 'Write', tool_input: { file_path: scratchTs, content: cleanSrc } }));
    if (res.status === 0) {
      record('Lint hook passes clean input (exit 0)', 4, 4, 'exited 0 on lint-clean file');
    } else {
      record('Lint hook passes clean input (exit 0)', 0, 4, `expected exit 0, got ${res.status ?? res.error?.message ?? 'unknown'}`);
    }
  }
}

// -- Secret hook: blocks (exit 2) on secret-shaped content -- (8)
const secretSamples = [
  { label: 'AWS access key ID', content: 'const cfg = { key: "AKIAABCDEFGHIJKLMNOP" };\n' },
  { label: 'sk- style token', content: 'const apiKey = "sk-ABCDEFGHIJKLMNOPQRSTUVWX1234567890";\n' },
  { label: 'PEM private key header', content: '-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----\n' },
];
{
  if (!preToolUse) {
    record('Secret hook blocks secret-shaped content (exit 2)', 0, 8, 'no PreToolUse hook wired');
  } else {
    let caught = 0;
    const details = [];
    for (const sample of secretSamples) {
      const res = runHookCommand(preToolUse.command, { tool_name: 'Write', tool_input: { file_path: 'src/__grade_secret_scratch__.ts', content: sample.content } });
      if (res.status === 2) {
        caught++;
      } else {
        details.push(`${sample.label}: expected exit 2, got ${res.status ?? res.error?.message ?? 'unknown'}`);
      }
    }
    const pts = Math.round((caught / secretSamples.length) * 8);
    record('Secret hook blocks secret-shaped content (exit 2)', pts, 8, `${caught}/${secretSamples.length} secret shapes caught${details.length ? '; ' + details.join('; ') : ''}`);
  }
}

// -- Secret hook: passes (exit 0) on clean content -- (6)
{
  if (!preToolUse) {
    record('Secret hook passes clean content (exit 0)', 0, 6, 'no PreToolUse hook wired');
  } else {
    const res = runHookCommand(preToolUse.command, { tool_name: 'Write', tool_input: { file_path: 'src/__grade_secret_scratch__.ts', content: 'export const greeting = "hello";\n' } });
    if (res.status === 0) {
      record('Secret hook passes clean content (exit 0)', 6, 6, 'exited 0 on secret-free content');
    } else {
      record('Secret hook passes clean content (exit 0)', 0, 6, `expected exit 0, got ${res.status ?? res.error?.message ?? 'unknown'}`);
    }
  }
}

// ===========================================================================
// Tool usage (25)
// ===========================================================================

// -- settings.json valid, hooks wired to the right events with sane matchers -- (10)
{
  if (settingsRaw === null) {
    record('settings.json wires hooks to PostToolUse/PreToolUse/Stop', 0, 10, '.claude/settings.json not found');
  } else if (settingsParseError) {
    record('settings.json wires hooks to PostToolUse/PreToolUse/Stop', 0, 10, `invalid JSON: ${settingsParseError}`);
  } else {
    let pts = 0;
    const details = [];
    if (postToolUse) {
      pts += postToolUse.matcher && /Write/.test(postToolUse.matcher) ? 4 : 2;
      details.push(`PostToolUse -> "${postToolUse.command}" (matcher: ${postToolUse.matcher ?? 'none'})`);
    } else {
      details.push('PostToolUse: not wired');
    }
    if (preToolUse) {
      pts += preToolUse.matcher && /Write/.test(preToolUse.matcher) ? 4 : 2;
      details.push(`PreToolUse -> "${preToolUse.command}" (matcher: ${preToolUse.matcher ?? 'none'})`);
    } else {
      details.push('PreToolUse: not wired');
    }
    if (stopHook) {
      pts += 2;
      details.push(`Stop -> "${stopHook.command}"`);
    } else {
      details.push('Stop: not wired');
    }
    record('settings.json wires hooks to PostToolUse/PreToolUse/Stop', Math.min(pts, 10), 10, details.join('; '));
  }
}

// -- workflow YAML exists, well-formed, triggers on pull_request -- (5)
const workflowPath = '.github/workflows/claude-review.yml';
const workflowRaw = readIfExists(workflowPath);

function heuristicYamlOk(text) {
  if (/\t/.test(text)) return { ok: false, reason: 'contains tab characters (invalid YAML indentation)' };
  if (!/^[A-Za-z0-9_-]+:/m.test(text)) return { ok: false, reason: 'no top-level key found' };
  return { ok: true, reason: 'passed heuristic structural check' };
}

let yamlValid = false;
let yamlDetail = '';
{
  if (workflowRaw === null) {
    yamlDetail = `${workflowPath} not found`;
  } else {
    let parsed = null;
    let usedRealParser = false;
    try {
      const yaml = require_('js-yaml');
      parsed = yaml.load(workflowRaw);
      usedRealParser = true;
    } catch (err) {
      if (err && err.name === 'YAMLException') {
        yamlValid = false;
        yamlDetail = `js-yaml parse error: ${err.message.split('\n')[0]}`;
      }
    }
    if (usedRealParser && parsed) {
      yamlValid = typeof parsed === 'object';
      yamlDetail = 'parsed successfully with js-yaml';
    } else if (!yamlDetail) {
      const h = heuristicYamlOk(workflowRaw);
      yamlValid = h.ok;
      yamlDetail = h.reason;
    }
  }
}
const triggersOnPR = workflowRaw !== null && /\bon:/.test(workflowRaw) && /pull_request/.test(workflowRaw);
{
  if (workflowRaw === null) {
    record('claude-review.yml exists, valid YAML, triggers on pull_request', 0, 5, yamlDetail);
  } else {
    let pts = 0;
    if (yamlValid) pts += 3;
    if (triggersOnPR) pts += 2;
    record('claude-review.yml exists, valid YAML, triggers on pull_request', pts, 5, `${yamlDetail}; pull_request trigger: ${triggersOnPR ? 'found' : 'not found'}`);
  }
}

// -- headless invocation + --allowedTools restricted to Read/Grep/Glob -- (10)
{
  if (workflowRaw === null) {
    record('Claude review step is headless with tools restricted to Read/Grep/Glob', 0, 10, `${workflowPath} not found`);
  } else {
    let pts = 0;
    const details = [];

    const headlessEvidence = /claude\s+.*-p\b/.test(workflowRaw) || /claude-code-action/.test(workflowRaw);
    const jsonOutputEvidence = /--output-format\s+json/.test(workflowRaw) || /output_format["']?\s*[:=]\s*["']?json/i.test(workflowRaw);
    if (headlessEvidence) {
      pts += 3;
      details.push('headless invocation evidence found');
    } else {
      details.push('no evidence of headless claude -p / claude-code-action invocation');
    }
    if (jsonOutputEvidence) {
      pts += 2;
      details.push('--output-format json evidence found');
    } else {
      details.push('no --output-format json evidence');
    }

    const allowedToolsMatch = workflowRaw.match(/--allowedTools[= ]["']?([A-Za-z, ]+)["']?|allowed_tools:\s*["']?([A-Za-z, ]+)["']?/);
    if (allowedToolsMatch) {
      const list = (allowedToolsMatch[1] || allowedToolsMatch[2] || '').toLowerCase();
      const hasReadGrepGlob = ['read', 'grep', 'glob'].every((t) => list.includes(t));
      const hasDangerous = ['write', 'edit', 'bash'].some((t) => list.includes(t));
      if (hasReadGrepGlob && !hasDangerous) {
        pts += 5;
        details.push(`--allowedTools restricted correctly: "${list.trim()}"`);
      } else if (hasReadGrepGlob) {
        pts += 2;
        details.push(`--allowedTools includes Read/Grep/Glob but also grants: "${list.trim()}" (not least-privilege)`);
      } else {
        details.push(`--allowedTools found but doesn't cover Read/Grep/Glob: "${list.trim()}"`);
      }
    } else {
      details.push('no --allowedTools / allowed_tools restriction found');
    }
    record('Claude review step is headless with tools restricted to Read/Grep/Glob', pts, 10, details.join('; '));
  }
}

// ===========================================================================
// Code quality (20)
// ===========================================================================

// -- Hooks don't crash on malformed/empty stdin (4 pts each x3 = 12) --
{
  const wired = [
    ['PostToolUse (lint) hook', postToolUse],
    ['PreToolUse (secret) hook', preToolUse],
    ['Stop hook', stopHook],
  ];
  let total = 0;
  const details = [];
  for (const [label, w] of wired) {
    if (!w) {
      details.push(`${label}: not wired`);
      continue;
    }
    const garbage = runHookCommand(w.command, 'not-json{{{garbage');
    const empty = runHookCommand(w.command, '');
    const bothClean = garbage.status === 0 && empty.status === 0;
    const bothSafe = [garbage.status, empty.status].every((s) => s === 0 || s === 2);
    if (bothClean) {
      total += 4;
      details.push(`${label}: degrades to exit 0 on malformed/empty stdin`);
    } else if (bothSafe) {
      total += 2;
      details.push(`${label}: doesn't crash but exits 2 (blocks) on unparseable input instead of degrading to 0`);
    } else {
      details.push(`${label}: crashes or exits unexpectedly on bad input (garbage=${garbage.status ?? 'err'}, empty=${empty.status ?? 'err'})`);
    }
  }
  record('Hooks handle malformed/empty stdin without crashing', total, 12, details.join('; '));
}

// -- Workflow has an explicit fail path tied to review findings -- (8)
{
  if (workflowRaw === null) {
    record('Workflow fails the build on a critical review finding', 0, 8, `${workflowPath} not found`);
  } else {
    const failPatterns = [/exit\s+1\b/, /process\.exit\(\s*1\s*\)/, /core\.setFailed/, /exit\(1\)/i];
    let evidenceText = workflowRaw;

    // Follow any locally-referenced script (e.g. `node scripts/check-review.mjs`)
    // and check it too — the fail logic often lives there, not inline in the YAML.
    const scriptRefs = [...workflowRaw.matchAll(/node\s+([^\s"']+\.mjs)/g)].map((m) => m[1]);
    for (const ref of scriptRefs) {
      const scriptContent = readIfExists(ref);
      if (scriptContent) evidenceText += `\n${scriptContent}`;
    }

    const found = failPatterns.some((re) => re.test(evidenceText));
    if (found) {
      record('Workflow fails the build on a critical review finding', 8, 8, 'found an explicit non-zero exit / setFailed path tied to review output');
    } else {
      record('Workflow fails the build on a critical review finding', 0, 8, 'no explicit fail path found (exit 1 / process.exit(1) / core.setFailed) in the workflow or any locally-referenced script');
    }
  }
}

// ===========================================================================
// Best practices (10)
// ===========================================================================

// -- No hardcoded secret literal in the workflow YAML -- (5)
{
  if (workflowRaw === null) {
    record('No hardcoded API key/token in workflow YAML', 0, 5, `${workflowPath} not found`);
  } else {
    const literalPatterns = [/AKIA[0-9A-Z]{16}/, /sk-[a-zA-Z0-9]{20,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
    const hasLiteral = literalPatterns.some((re) => re.test(workflowRaw));
    const usesSecrets = /secrets\./.test(workflowRaw);
    let pts = 0;
    const details = [];
    if (!hasLiteral) {
      pts += 3;
      details.push('no secret-shaped literal found');
    } else {
      details.push('a secret-shaped literal appears directly in the workflow YAML');
    }
    if (usesSecrets) {
      pts += 2;
      details.push('references GitHub Actions secrets (secrets.*)');
    } else {
      details.push('no secrets.* reference found');
    }
    record('No hardcoded API key/token in workflow YAML', pts, 5, details.join('; '));
  }
}

// -- Pre-existing permissions block preserved -- (5)
{
  const baselineAllow = ['Bash(npm test)', 'Bash(npm run lint)'];
  const baselineDeny = ['Bash(rm:*)'];
  const baselineAsk = ['Bash(git push:*)'];
  if (settingsRaw === null || settingsParseError) {
    record('Pre-existing permissions block preserved', 0, 5, settingsParseError ? `invalid JSON: ${settingsParseError}` : 'settings.json not found');
  } else {
    const allow = settings.permissions?.allow ?? [];
    const deny = settings.permissions?.deny ?? [];
    const ask = settings.permissions?.ask ?? [];
    const allowOk = baselineAllow.every((e) => allow.includes(e));
    const denyOk = baselineDeny.every((e) => deny.includes(e));
    const askOk = baselineAsk.every((e) => ask.includes(e));
    const okCount = [allowOk, denyOk, askOk].filter(Boolean).length;
    const pts = Math.round((okCount / 3) * 5);
    record('Pre-existing permissions block preserved', pts, 5, `allow baseline intact: ${allowOk}; deny baseline intact: ${denyOk}; ask baseline intact: ${askOk}`);
  }
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 5 Assessment — Grade Report');
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
