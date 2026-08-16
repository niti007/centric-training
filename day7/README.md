# Day 7 — Best Practices, Capstone & Graduation

Duration: 6 hours, weekend intensive. This is the **final day** of the programme. It continues directly from Day 6's `TaskFlow API` state — same repo, carried forward with Day 6's solution already merged in (three reviewer sub-agents, `.mcp.json`, `plugins/taskflow-kit/`; the ownership and N+1 defects fixed).

## Objectives

By the end of today you can:

- Scope Claude Code's permissions the way a real team should: `--allowedTools`, `.claude/settings.json` allow/deny/ask lists, and why secrets never belong in `CLAUDE.md`.
- Handle untrusted repo content safely, using an unescaped-HTML notification bug as the worked example.
- Run a pre-merge verification checklist and name the categories of change that never get accepted unreviewed (auth, migrations, money, deletes).
- Write prompts that front-load specificity, constraints, and acceptance criteria, and reach for plan mode before a non-trivial change.
- Keep a session's context healthy: read `/context`, use `/compact` deliberately, know when to reset.
- Adopt Claude Code as a team practice — share `CLAUDE.md`/skills/plugins, set review norms for agent-authored PRs, onboard a new developer in a day.
- Watch spend with `/cost` and route work to the right model tier, and know when a team should reach for the Claude Agent SDK instead of the CLI.
- Build and present a real capstone project end to end, under real time pressure, in a team.

## The three blocks

| Block | Length | What happens |
|---|---|---|
| **1 — Best Practices Deep Dive** | 1.5 hrs | Trainer-led. Security, output verification, prompt engineering, context hygiene, team adoption, cost governance. Closes with a graded practical: fix a real security bug and harden this repo's permission policy. |
| **2 — Capstone Build** | 3 hrs | Teams of 2–3 (formed on Day 5) build their chosen track from `capstone/CAPSTONE.md`. Trainer circulates; there is a mandatory checkpoint at the halfway mark to catch teams that have scoped too big. |
| **3 — Presentations & Wrap** | 1.5 hrs | 10-minute demo + Q&A per team, using the demo script template in `capstone/CAPSTONE.md`. Programme summary, roadmap, feedback, certificates. |

Today is where the whole week lands: Block 1 is the last new material, and Blocks 2–3 are you building and shipping something real with everything the programme has covered, then explaining it to the room — including what Claude got wrong along the way.

## What's different from Day 6

Day 7 ships with the full `.claude/` accumulation from every prior day — commands, skills, hooks, sub-agents, MCP config, and the plugin scaffold. One thing has deliberately **not** been fixed yet: `src/services/notifyService.ts` still builds notification HTML by interpolating a task's title, description, and a user's name directly into a string with no escaping. That's Block 1's graded practical, not an oversight left over from an earlier day.

## What you'll build

**Block 1 (graded practical, see `ASSESSMENT.md`)**: fix the unescaped-HTML notification bug with a real regression test, harden `.claude/settings.json` beyond its current baseline, and add `.claude/rules/security.md` + `.claude/rules/testing.md` as standing rules for the codebase.

**Blocks 2–3**: the capstone project. Full scenario, tracks, constraints, submission format, and rubric live in `capstone/CAPSTONE.md` — this repo doesn't repeat it. Your team, track, and starter scaffold were already assigned on Day 5.

## How to start

```bash
git clone <this-repo-url>
cd day7
npm ci
npm test
```

**`npm test` should be fully green — 35 passing tests, 13 suites.** Day 7 is a "green by default" day: any red here is a real problem, not an intentional defect. See `SETUP.md` if your result doesn't match.

Once your test run matches, follow `TEACH.md` (trainer) or go straight to `LAB.md` (learner) for Block 1, then `ASSESSMENT.md` for the graded practical. For Blocks 2 and 3, go to `capstone/CAPSTONE.md`.

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script — Block 1 in full, short logistics notes for Blocks 2–3 |
| `LAB.md` | learner lab exercise for Block 1 |
| `ASSESSMENT.md` | Block 1's graded practical task |
| `RUBRIC.md` | scoring criteria for the Block 1 practical (the capstone has its own rubric in `capstone/CAPSTONE.md`) |
| `SETUP.md` | pre-session state check |
| `CLAUDE.md` | project memory — already present, carried forward |
| `.claude/` | commands, skills, hooks, sub-agents, and settings accumulated through Day 6 |
| `.mcp.json`, `mcp/` | MCP server config and skeleton from Day 6 |
| `plugins/taskflow-kit/` | plugin scaffold from Day 6 |
| `src/`, `tests/` | TaskFlow API, carried forward from Day 6's solution |
| `scripts/verify-setup.mjs` | machine readiness check |
| `scripts/grade.mjs` | deterministic grader for the Block 1 assessment |
