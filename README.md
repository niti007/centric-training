# Claude Code Training Programme — Centric

7 days · 22 hours · Audience: Engineers

Every day is a **self-contained repository**. Learners clone one repo per day. Each day's starting code is the previous day's finished state, so anyone who falls behind can reset forward without carrying broken work.

The sample application throughout is **TaskFlow API** — a small Node 20 + TypeScript + Express service with deliberately realistic flaws.

## Day map

| Day | Topic | Duration | Repo |
|---|---|---|---|
| 1 | Introduction & Foundation | 2 hrs | `centric-cc-day1-foundation` |
| 2 | Core Developer Workflows & Code Generation | 2 hrs | `centric-cc-day2-dev-workflows` |
| 3 | QA Workflows & Testing Automation | 2 hrs | `centric-cc-day3-qa-testing` |
| 4 | Slash Commands, Skills & Customisation | 2 hrs | `centric-cc-day4-commands-skills` |
| 5 | Hooks, Automation & CI/CD Integration | 2 hrs | `centric-cc-day5-hooks-cicd` |
| 6 | Advanced: MCP, Sub-agents & Plugins | 6 hrs | `centric-cc-day6-mcp-agents-plugins` |
| 7 | Best Practices, Capstone & Graduation | 6 hrs | `centric-cc-day7-capstone` |

Total: 10 hrs weekday sessions + 12 hrs weekend intensives.

## What's in every day repo

| File | For | Purpose |
|---|---|---|
| `README.md` | everyone | Day overview, objectives, how to start |
| `TEACH.md` | trainer | Minute-by-minute teaching script + live demo steps |
| `LAB.md` | learner | Hands-on exercise, timeboxed |
| `ASSESSMENT.md` | learner | The day's graded practical task |
| `RUBRIC.md` | trainer | Scoring criteria |
| `src/`, `tests/` | learner | TaskFlow API at that day's starting state |
| `.claude/` | learner | Artifacts accumulated through that day |
| `scripts/grade.mjs` | trainer | Deterministic auto-check for the graded task |

## Assessment model

Practical only — no multiple choice. One graded task per day, scored on the programme's standard weights:

| Criterion | Weight |
|---|---|
| Functionality | 30% |
| Tool usage | 25% |
| Code quality | 20% |
| Presentation | 15% |
| Best practices | 10% |

Graders check **artifacts on disk and test results**, never chat transcripts.

## Capstone

Handed out at the end of Day 5, built during Day 7. Three tracks (feature development, QA automation, full agentic pipeline). See `capstone/CAPSTONE.md`.

## Prerequisites for learners

- Node.js 20+ and npm
- Git
- A terminal, and an editor of choice
- Claude Code installed and authenticated (Day 1 covers this; `day1/SETUP.md` should be sent 48 hours ahead)

---

**Trainers**: see `INSTRUCTOR.md` for the seeded-defect map, timing notes, and answer keys. That file is local only and is never pushed to the day repositories.
