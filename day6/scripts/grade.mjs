#!/usr/bin/env node
// Day 6 deterministic grader.
//
// Inspects files on disk only — never reads chat logs or transcripts. Run
// as: node scripts/grade.mjs
//
// Scores Functionality (30), Tool usage (25), Code quality (20), Best
// practices (10) — total 85. Presentation (15) is scored by hand from the
// learner's NOTES.md entries (## MCP Context Cost, ## Planner-Implementer-
// Reviewer, ## Plugin Install Verification) and is NOT included in this
// script's total; that is printed as a reminder, not a score.
//
// Validated to score low and exit non-zero against Day 6's unmodified
// starting state (no .claude/agents/, no .mcp.json, no reports/review.md,
// plugin directories still holding only their placeholder README.md). If
// it doesn't, the grader is broken — don't trust its score.

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

function listFiles(relDir) {
  const p = path.join(root, relDir);
  if (!existsSync(p)) return null;
  try {
    return readdirSync(p).filter((f) => statSync(path.join(p, f)).isFile());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Minimal YAML-frontmatter parser for agent files. Not a real YAML
// parser — good enough for the flat `key: value` frontmatter Claude Code
// agent files use, including a comma-separated `tools:` list.
// ---------------------------------------------------------------------
function parseFrontmatter(src) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!match) return null;
  const body = match[1];
  const fm = {};
  for (const line of body.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

function parseToolsList(toolsValue) {
  if (!toolsValue) return [];
  return toolsValue
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------
// Functionality (30)
// ---------------------------------------------------------------------
const expectedAgents = ['security-reviewer', 'perf-reviewer', 'style-reviewer'];
const allowedTools = new Set(['Read', 'Grep', 'Glob']);

const agentInfo = expectedAgents.map((name) => {
  const src = readIfExists(`.claude/agents/${name}.md`);
  if (src === null) return { name, found: false, valid: false, tools: [] };
  const fm = parseFrontmatter(src);
  if (!fm || !fm.name || !fm.description || !fm.tools) {
    return { name, found: true, valid: false, tools: [] };
  }
  return { name, found: true, valid: true, tools: parseToolsList(fm.tools) };
});

{
  const validCount = agentInfo.filter((a) => a.valid).length;
  const points = Math.round((validCount / expectedAgents.length) * 10);
  const detail = agentInfo
    .map((a) => `${a.name}.md: ${a.found ? (a.valid ? 'valid frontmatter' : 'found but missing name/description/tools') : 'missing'}`)
    .join('; ');
  record('3 reviewer agent files exist with valid frontmatter', points, 10, detail);
}
{
  let scoped = 0;
  const detailParts = [];
  for (const a of agentInfo) {
    if (!a.valid) {
      detailParts.push(`${a.name}: n/a (agent invalid/missing)`);
      continue;
    }
    const disallowed = a.tools.filter((t) => !allowedTools.has(t));
    if (a.tools.length > 0 && disallowed.length === 0) {
      scoped += 1;
      detailParts.push(`${a.name}: read-only (${a.tools.join(', ')})`);
    } else {
      detailParts.push(`${a.name}: ${disallowed.length > 0 ? `grants disallowed tool(s) ${disallowed.join(', ')}` : 'no tools listed'}`);
    }
  }
  const points = Math.round((scoped / expectedAgents.length) * 10);
  record('agent tools scoped read-only (Read, Grep, Glob only)', points, 10, detailParts.join('; '));
}
{
  const mcpRaw = readIfExists('.mcp.json');
  if (mcpRaw === null) {
    record('.mcp.json exists, valid JSON, registers a server', 0, 10, '.mcp.json not found at repo root');
  } else {
    try {
      const mcp = JSON.parse(mcpRaw);
      const servers = mcp.mcpServers && typeof mcp.mcpServers === 'object' ? Object.keys(mcp.mcpServers) : [];
      if (servers.length > 0) {
        record('.mcp.json exists, valid JSON, registers a server', 10, 10, `mcpServers: ${servers.join(', ')}`);
      } else {
        record('.mcp.json exists, valid JSON, registers a server', 3, 10, 'valid JSON but mcpServers is empty or missing');
      }
    } catch (err) {
      record('.mcp.json exists, valid JSON, registers a server', 0, 10, `invalid JSON: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------
// Tool usage (25)
// ---------------------------------------------------------------------
const reviewArtifact = readIfExists('reports/review.md');

{
  if (reviewArtifact === null) {
    record('reports/review.md exists', 0, 5, 'file not found');
  } else {
    record('reports/review.md exists', 5, 5, `found, ${reviewArtifact.length} chars`);
  }
}
{
  if (reviewArtifact === null) {
    record('names the tasks.ts ownership/authz finding', 0, 10, 'reports/review.md not found');
  } else {
    const mentionsFile = /routes\/tasks\.ts|tasks\.ts/i.test(reviewArtifact) || /PATCH\s*\/?tasks/i.test(reviewArtifact);
    const mentionsConcept = /ownership|authoriz|owns? the task|userid\s*!==|doesn'?t (check|verify) (that )?the (caller|requester|user)/i.test(reviewArtifact);
    if (mentionsFile && mentionsConcept) {
      record('names the tasks.ts ownership/authz finding', 10, 10, 'mentions tasks.ts (or PATCH route) and an ownership/authorization term');
    } else if (mentionsFile || mentionsConcept) {
      record('names the tasks.ts ownership/authz finding', 4, 10, `partial — ${mentionsFile ? 'names the file/route but not the concept' : 'names the concept but not the file/route'}`);
    } else {
      record('names the tasks.ts ownership/authz finding', 0, 10, 'no mention of tasks.ts/PATCH route or ownership/authorization terms found');
    }
  }
}
{
  if (reviewArtifact === null) {
    record('names the reportBuilder.ts N+1 finding', 0, 10, 'reports/review.md not found');
  } else {
    const mentionsFile = /reportBuilder\.ts|report ?builder/i.test(reviewArtifact);
    const mentionsConcept = /n\+1|per[- ]task lookup|per[- ]row|per[- ]iteration|once per|batch(ing)?|redundant (user )?lookup|looks? up (the |a )?(owning )?user/i.test(reviewArtifact);
    if (mentionsFile && mentionsConcept) {
      record('names the reportBuilder.ts N+1 finding', 10, 10, 'mentions reportBuilder.ts and an N+1/per-task-lookup term');
    } else if (mentionsFile || mentionsConcept) {
      record('names the reportBuilder.ts N+1 finding', 4, 10, `partial — ${mentionsFile ? 'names the file but not the N+1 concept' : 'names the concept but not reportBuilder.ts'}`);
    } else {
      record('names the reportBuilder.ts N+1 finding', 0, 10, 'no mention of reportBuilder.ts or N+1/per-task-lookup terms found');
    }
  }
}

// ---------------------------------------------------------------------
// Code quality (20)
// ---------------------------------------------------------------------
const pluginManifestRaw = readIfExists('plugins/taskflow-kit/plugin.json');
let pluginManifest = null;
let pluginPathsValid = { commands: false, skills: false, agents: false };

{
  if (pluginManifestRaw === null) {
    record('plugin.json valid, commands/skills/agents paths resolve', 0, 10, 'plugins/taskflow-kit/plugin.json not found');
  } else {
    try {
      pluginManifest = JSON.parse(pluginManifestRaw);
      const checks = ['commands', 'skills', 'agents'].map((key) => {
        const rel = pluginManifest[key];
        if (!rel || typeof rel !== 'string') return { key, ok: false, reason: 'missing from manifest' };
        const resolved = path.join(root, 'plugins/taskflow-kit', rel);
        const ok = existsSync(resolved) && statSync(resolved).isDirectory();
        pluginPathsValid[key] = ok;
        return { key, ok, reason: ok ? 'resolves' : `does not resolve (${rel})` };
      });
      const okCount = checks.filter((c) => c.ok).length;
      const points = Math.round((okCount / 3) * 10);
      record('plugin.json valid, commands/skills/agents paths resolve', points, 10, checks.map((c) => `${c.key}: ${c.reason}`).join('; '));
    } catch (err) {
      record('plugin.json valid, commands/skills/agents paths resolve', 0, 10, `invalid JSON: ${err.message}`);
    }
  }
}
{
  const dirKeys = ['commands', 'skills', 'agents'];
  const dirStatus = dirKeys.map((key) => {
    if (!pluginPathsValid[key]) return { key, populated: false, reason: 'directory missing/unresolved' };
    const rel = pluginManifest[key];
    const abs = path.join('plugins/taskflow-kit', rel);
    const files = listFiles(abs) ?? [];
    const realFiles = files.filter((f) => f.toLowerCase() !== 'readme.md');
    // skills often nest content one directory deeper (e.g. skills/api-endpoint/SKILL.md)
    let hasNested = false;
    if (realFiles.length === 0) {
      const p = path.join(root, abs);
      if (existsSync(p)) {
        for (const entry of readdirSync(p)) {
          const entryPath = path.join(p, entry);
          if (statSync(entryPath).isDirectory()) {
            const nested = readdirSync(entryPath).filter((f) => f.toLowerCase() !== 'readme.md');
            if (nested.length > 0) hasNested = true;
          }
        }
      }
    }
    const populated = realFiles.length > 0 || hasNested;
    return { key, populated, reason: populated ? `${realFiles.length || 'nested'} real file(s)` : 'only placeholder README.md (or empty)' };
  });
  const populatedCount = dirStatus.filter((d) => d.populated).length;
  const points = Math.round((populatedCount / 3) * 10);
  record('commands/skills/agents dirs populated beyond placeholder README', points, 10, dirStatus.map((d) => `${d.key}: ${d.reason}`).join('; '));
}

// ---------------------------------------------------------------------
// Best practices (10)
// ---------------------------------------------------------------------
{
  const baselineDeps = ['express', '@modelcontextprotocol/sdk'];
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
    record('no new dependencies added', 0, 5, 'package.json not found');
  } else {
    try {
      const pkg = JSON.parse(pkgRaw);
      const currentDeps = Object.keys(pkg.dependencies ?? {});
      const currentDevDeps = Object.keys(pkg.devDependencies ?? {});
      const newDeps = currentDeps.filter((d) => !baselineDeps.includes(d));
      const newDevDeps = currentDevDeps.filter((d) => !baselineDevDeps.includes(d));
      if (newDeps.length === 0 && newDevDeps.length === 0) {
        record('no new dependencies added', 5, 5, 'dependencies and devDependencies unchanged from Day 6 baseline');
      } else {
        const detail = [
          newDeps.length ? `new runtime dep(s): ${newDeps.join(', ')}` : null,
          newDevDeps.length ? `new dev dep(s): ${newDevDeps.join(', ')}` : null,
        ].filter(Boolean).join('; ');
        record('no new dependencies added', newDeps.length > 0 ? 0 : 2, 5, detail);
      }
    } catch (err) {
      record('no new dependencies added', 0, 5, `package.json invalid JSON: ${err.message}`);
    }
  }
}
{
  // Light "did you actually copy the real content" check: expected
  // filenames from this repo's own .claude/commands, .claude/skills,
  // .claude/agents showing up (possibly nested) under the plugin dirs.
  function dirContainsName(relDir, needle) {
    const abs = path.join(root, relDir);
    if (!existsSync(abs)) return false;
    const stack = [abs];
    while (stack.length) {
      const cur = stack.pop();
      for (const entry of readdirSync(cur)) {
        const entryPath = path.join(cur, entry);
        if (statSync(entryPath).isDirectory()) {
          stack.push(entryPath);
        } else if (entry.toLowerCase().includes(needle.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  }

  const cmdsOk = pluginManifest?.commands
    ? ['review', 'qa-report'].filter((n) => dirContainsName(path.join('plugins/taskflow-kit', pluginManifest.commands), n))
    : [];
  const skillOk = pluginManifest?.skills ? dirContainsName(path.join('plugins/taskflow-kit', pluginManifest.skills), 'skill.md') : false;
  const agentsOk = pluginManifest?.agents
    ? expectedAgents.filter((n) => dirContainsName(path.join('plugins/taskflow-kit', pluginManifest.agents), n))
    : [];

  const subChecks = [cmdsOk.length === 2, skillOk, agentsOk.length === 3];
  const passCount = subChecks.filter(Boolean).length;
  const points = Math.round((passCount / 3) * 5);
  const detail = `commands matched: ${cmdsOk.join(', ') || 'none'}; skill (SKILL.md) found: ${skillOk}; agents matched: ${agentsOk.join(', ') || 'none'}`;
  record('plugin content matches this repo\'s real commands/skill/agents', points, 5, detail);
}

// ---------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------
console.log('');
console.log('Day 6 Assessment — Grade Report');
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
