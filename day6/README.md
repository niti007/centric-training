# Day 6 — MCP, Sub-agents & Plugins

Duration: 6 hours (weekend intensive). Continues directly from Day 5 — same **TaskFlow API** repo, carried forward with Day 5's solution already merged in (hooks wired into `.claude/settings.json`, `.github/workflows/claude-review.yml`, the `/review` and `/qa-report` commands, the `api-endpoint` skill).

This is the densest day in the programme: three heavy blocks in six hours, each teaching a distinct way of extending what Claude Code can reach and who — or what — does the work. Pace yourself against the block timings in `LAB.md`, not against how interesting any one topic feels in the moment.

## Objectives

By the end of today you can:

- Explain what MCP is and why a protocol beats a bespoke integration per tool; distinguish stdio vs HTTP/SSE transports and know when a server needs OAuth.
- Register an MCP server at the right scope (`local` / `project` / `user`) with `claude mcp add|list|remove`, including a first-party connector (GitHub) and a local server you connect yourself.
- Reason about MCP's context cost and security surface — including prompt injection carried in a malicious tool description — instead of treating "connect everything" as free.
- Build scoped, read-only sub-agents (`.claude/agents/*.md`) and know when delegating to one is worth the handoff cost and when it isn't.
- Run a team of specialist sub-agents in parallel and consolidate their independent findings into one review.
- Chain agents in an orchestration pattern — planner → implementer → reviewer — for a small real feature.
- Package commands, a skill, and agents into a plugin with a versioned manifest, and install that plugin into a different repo.
- Explain the CLAUDE.md memory hierarchy and where `.claude/rules` fits in precedence.

## What's different from Day 5

Day 6 ships with Day 5's hooks, workflow, commands, and skill already in place — read `.claude/settings.json`, `.github/workflows/claude-review.yml`, and `.claude/commands/` before you start if you haven't seen them. Today adds three things this repo does **not** yet have: sub-agents (`.claude/agents/`), an MCP connection (`.mcp.json`), and a plugin (`plugins/taskflow-kit/`). Two of those three are pre-provided as starting scaffolds so the exercises are fill-in-the-blank rather than from-scratch — see "What's pre-provided" below.

`src/routes/tasks.ts` and `src/legacy/reportBuilder.ts` still carry the same unresolved issues they've had since Day 1: a mutation route that doesn't check ownership the way its siblings do, and a legacy report builder that re-looks-up the same users on every row instead of once. Nobody has told you where they are — that's what your Block 2 sub-agents are for.

## What's pre-provided (and why)

Three blocks in six hours is tight even by this programme's standards. Two scaffolds ship pre-built so you spend Block 1 and Block 3 wiring and verifying rather than writing protocol boilerplate from scratch:

- **`mcp/taskflow-server.mjs`** — a working local stdio MCP server exposing one tool, `list_overdue_tasks`. It reads from `dist/services/taskService.js`, so `npm run build` has to have run before you connect it. Registering it (writing `.mcp.json`) is your exercise, not the server code itself.
- **`plugins/taskflow-kit/`** — a `plugin.json` manifest plus empty `commands/`, `skills/`, and `agents/` directories (each with a placeholder `README.md` explaining what belongs there). Populating those directories with real content — the Day 4 commands and skill, the Day 6 reviewer agents — is the Block 3 exercise.

Nothing else is pre-built: `.claude/agents/` doesn't exist yet, `.mcp.json` doesn't exist yet, and the plugin's subdirectories are empty. Building those is today's work.

## How to start

```bash
git clone <this-repo-url>
cd day6
npm ci
npm test
```

**`npm test` should show all 32 tests passing.** Day 6 starts from a green baseline (Day 5's solution didn't touch `src/` or `tests/`) — any red here is a real problem, check your Node version (`v20.x`) before doing anything else. See `SETUP.md` if your result doesn't match.

Once your test run is green, work through `TEACH.md`'s three blocks (if you're the trainer) or `LAB.md`'s exercises (if you're the learner), in order — each block's exercise depends on artifacts the previous block built. `ASSESSMENT.md` is the graded practical, separate from the lab.

## Structure of the day

| Block | Time | Topic |
|---|---|---|
| 1 | 2 hrs | MCP — protocol, transports, scopes, connectors, security, context cost |
| 2 | 2 hrs | Sub-agents & agent teams — isolated context, scoped tools, orchestration |
| 3 | 1.5 hrs + 0.5 hr wrap | Plugins & production patterns — manifest, packaging, memory hierarchy |

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script — all three blocks, demos, talking points |
| `LAB.md` | learner lab exercise, timeboxed to the three blocks |
| `ASSESSMENT.md` | graded practical task |
| `RUBRIC.md` | scoring criteria |
| `SETUP.md` | pre-session state check (short — see Day 1's `SETUP.md` for the original install walkthrough) |
| `CLAUDE.md` | project memory — already present, read it first |
| `.claude/settings.json`, `.claude/hooks/`, `.claude/commands/`, `.claude/skills/` | carried forward from Day 5 |
| `.github/workflows/claude-review.yml` | carried forward from Day 5 |
| `mcp/taskflow-server.mjs` | pre-provided MCP server skeleton — yours to connect, not to rewrite |
| `plugins/taskflow-kit/` | pre-provided plugin scaffold — yours to populate |
| `src/`, `tests/` | TaskFlow API, carried forward from Day 5's solution |
| `scripts/verify-setup.mjs` | machine readiness check (same as Day 1) |
| `scripts/grade.mjs` | deterministic grader for the assessment |
