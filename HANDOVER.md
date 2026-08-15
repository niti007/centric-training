# HANDOVER — Claude Code Training Programme

Everything needed to pick this build up on another machine.

**Repo**: `niti007/centric-training` (**private** — contains answer keys)
**Client**: Great Learning for Business / Centric
**Deliverable**: 7-day, 22-hour Claude Code training programme for engineers, plus practice assessments and a capstone.

---

## 1. Set up on a new laptop

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 or later | `node --version` |
| npm | ships with Node | `npm --version` |
| Git | any recent | `git --version` |
| GitHub CLI | any recent | `gh --version` |
| Claude Code | latest | `claude --version` |

Install Node from https://nodejs.org (LTS). Install the GitHub CLI from https://cli.github.com. Install Claude Code with:

```bash
npm install -g @anthropic-ai/claude-code
```

### Clone and install

```bash
gh auth login                                    # authenticate as niti007
git clone https://github.com/niti007/centric-training.git
cd centric-training
```

`node_modules/` is deliberately **not** committed — it is large and platform-specific. Install per day folder as you need it:

```bash
cd day1 && npm ci
```

Or install all seven at once:

```bash
# bash / git bash
for d in day1 day2 day3 day4 day5 day6 day7; do (cd $d && npm ci); done
```

```powershell
# PowerShell
foreach ($d in 1..7) { Push-Location "day$d"; npm ci; Pop-Location }
```

Each day folder is a fully self-contained Node project — its own `package.json`, `package-lock.json`, `tsconfig.json`, `jest.config.ts`, `eslint.config.mjs`. There is no root-level `package.json` and no workspace linking. Nothing else is required.

### Confirm the install worked

```bash
cd day1
node scripts/verify-setup.mjs   # must print all green
npm test                        # MUST show 3 failed / 19 passed — see below
```

**3 failing tests in day1 is correct.** They encode seeded defects that are the subject of Day 3. Do not fix them.

---

## 2. What is in this repo

```
centric-training/
├─ README.md              programme index — day map, assessment model
├─ INSTRUCTOR.md          NEVER PUBLISH — seeded-defect map, answer keys, timings
├─ HANDOFF.md             build-state log from the previous session
├─ HANDOVER.md            this file
├─ capstone/
│   ├─ CAPSTONE.md        full capstone brief — 3 tracks, rubric, demo script
│   └─ starters/          EMPTY — still to build (see §4)
├─ solutions/day1..day7/  NEVER PUBLISH — reference answers + SOLUTION.md each
├─ _build/baseline/       canonical app; scratch, not published
└─ day1/ .. day7/         seven self-contained repo roots
```

### The sample application

**TaskFlow API** — Node 20 + TypeScript + Express 4 + Jest + Supertest + ESLint. A small task-management service with deliberately realistic flaws.

```
src/
  index.ts                  Express app factory (createApp)
  routes/{tasks,users,auth}.ts
  services/{taskService,userService,notifyService}.ts
  repo/taskRepo.ts          in-memory store, seeded fixtures
  legacy/reportBuilder.ts   ~300-line god function, Day 2 refactor target
  util/{validate,dates,money}.ts
tests/                      deliberately sparse
scripts/verify-setup.mjs    machine readiness check
scripts/grade.mjs           deterministic grader for that day's assessment
```

### Day progression

Each `dayN/` ships the app at that day's **starting** state, which is the previous day's finished state. A learner clones exactly one repo per day and can reset forward if they fall behind.

| Day | Topic | Hours | Target public repo |
|---|---|---|---|
| 1 | Introduction & Foundation | 2 | `centric-cc-day1-foundation` |
| 2 | Core Developer Workflows & Code Generation | 2 | `centric-cc-day2-dev-workflows` |
| 3 | QA Workflows & Testing Automation | 2 | `centric-cc-day3-qa-testing` |
| 4 | Slash Commands, Skills & Customisation | 2 | `centric-cc-day4-commands-skills` |
| 5 | Hooks, Automation & CI/CD | 2 | `centric-cc-day5-hooks-cicd` |
| 6 | MCP, Sub-agents & Plugins | 6 | `centric-cc-day6-mcp-agents-plugins` |
| 7 | Best Practices & Capstone | 6 | `centric-cc-day7-capstone` |

### Expected test state per day

| Day | `npx tsc --noEmit` | `npm test` |
|---|---|---|
| 1 | pass | 19 pass / **3 fail — intentional** |
| 2 | pass | 22 pass / **3 fail — intentional** |
| 3 | pass | 25 pass / **3 fail — intentional** |
| 4 | pass | 32 pass / 0 fail |
| 5 | pass | 32 pass / 0 fail |
| 6 | pass | 32 pass / 0 fail |
| 7 | pass | 35 pass / 0 fail |

Verified on 2026-08-15. Any deviation is a real regression — check the Node version first.

The three intentional failures are the same on days 1–3: pagination boundary, timezone comparison, float accumulation. They are fixed by the Day 3 solution, which is why day4 onward is green.

---

## 3. Current build state

| Item | Status |
|---|---|
| Root scaffold, `README.md`, `INSTRUCTOR.md` | done |
| TaskFlow app, 6 seeded defects, 7 day states | done, verified |
| `solutions/day1..day7` reference answers | done |
| `capstone/CAPSTONE.md` | done |
| **Day 1 content** (README, TEACH, LAB, ASSESSMENT, RUBRIC, SETUP, grade.mjs) | **done, verified** |
| Day 2–7 content | **not started** |
| `capstone/starters/` | **not started** |
| Seven public per-day GitHub repos | **not started** |

Day 1 is the format reference. Days 2–7 should match its shape exactly.

### Day 1 file set (the template for all other days)

| File | Audience | Contents |
|---|---|---|
| `README.md` | everyone | Objectives, duration, how to start, the "3 tests fail by design" warning |
| `SETUP.md` | learner | Pre-work, sent 48 hours ahead. Install, auth, proxy notes, readiness proof |
| `TEACH.md` | trainer | Minute-by-minute script. Per block: talking points, one question for the room, the misconception to pre-empt, cut markers |
| `LAB.md` | learner | Timeboxed steps. Per step: goal, exact commands, definition of done, "stuck?" hint |
| `ASSESSMENT.md` | learner | Graded practical, acceptance-criteria checklist, submission list |
| `RUBRIC.md` | trainer | 30/25/20/15/10 expanded into observable descriptors |
| `scripts/grade.mjs` | trainer | Deterministic grader, disk-only, fails on start state |

---

## 4. What to do next, in order

### Step 1 — Day 2 and Day 3 content

Build the seven-file set above for `day2/` and `day3/`, matching Day 1's format and tone. Source material is the plan file (see §6) — it has a Teach / Demo / Exercise / Graded-practical breakdown per day, mapped to the client's TOC so nothing sold goes undelivered.

Day 2 = conversation-driven coding, file ops, code generation, refactoring, documentation, context management (`/context`, `/compact`, checkpoints), model tiers.
Day 3 = unit and integration test generation, TDD, debugging, code review, verifying AI output, regression automation. The live-debug of the timezone defect is the emotional centrepiece of the whole course — see `INSTRUCTOR.md` §2.

### Step 2 — Day 4, 5, 6 content

Day 4 = slash commands, `SKILL.md`, `.claude/` organisation, progressive disclosure.
Day 5 = full hook lifecycle, headless mode, GitHub Actions / Azure DevOps, restrictive permissions, automated PR review. **Capstone brief is handed out at the end of this day.**
Day 6 = MCP (transports, scopes, security), sub-agents and agent teams, plugins. Three blocks in six hours; this is the tightest day.

### Step 3 — Day 7 content and capstone starters

Day 7 = best-practices deep dive, then 3 hours of capstone build, then presentations.

Also build `capstone/starters/option-a`, `option-b`, `option-c` — minimal scaffolds, one per capstone track. `CAPSTONE.md` already tells teams to use them, so this is a promise currently unmet.

### Step 4 — Verification pass

Per day, confirm:

- `npm ci`, `npx tsc --noEmit`, `npm test` behave exactly as the table in §2 says
- `node scripts/grade.mjs` **fails on that day's starting state and passes on that day's solution**. A grader that passes on the start state is broken and its score is meaningless
- no `INSTRUCTOR.md`, no `SOLUTION.md`, no `solutions/` content inside any `dayN/`
- every TOC bullet for that day appears somewhere in that day's `TEACH.md`
- `LAB.md` timings sum to the day's duration

### Step 5 — Publish the seven public day repos

From the repo root, per day:

```bash
cd day1
git init
git add -A
git commit -m "Day 1 — Introduction & Foundation"
gh repo create centric-cc-day1-foundation --public --source=. --push
gh repo edit centric-cc-day1-foundation \
  --description "Claude Code Training — Day 1: Introduction & Foundation" \
  --add-topic claude-code --add-topic training --add-topic day1
```

Before running this, confirm each `dayN/.gitignore` excludes `node_modules/`, `dist/`, `INSTRUCTOR.md`, `SOLUTION.md`, and `solutions/`. Then verify: clone each published repo into a temp directory, run `npm ci && npm test`, and confirm the result matches §2.

---

## 5. Things you must not get wrong

- **`INSTRUCTOR.md` and `solutions/` never go public.** They contain every answer and the full seeded-defect map. That is why this repo is private.
- **The 3 failing tests on days 1–3 are intentional.** Do not fix them. Do not let a helpful agent fix them.
- **Test filenames must stay neutral.** They were renamed once already because `taskService.pagination.test.ts` handed a Day 1 learner the answer to Day 3. Keep names generic: `taskService.list.test.ts`, `dates.test.ts`, `money.test.ts`.
- **Day 1 has no `CLAUDE.md`.** Learners author it — that is the Day 1 lab and assessment. Days 2–7 ship with it. Do not "helpfully" add one to day1.
- **`CLAUDE.md` heading text is load-bearing.** The grader matches `## Commands`, `## Architecture`, `## Conventions`, `## Do Not Touch` literally. Changing the wording breaks grading.
- **Model references stay tier-generic** — Opus, Sonnet, Haiku. Never version numbers; they date the material within months.
- **The client TOC ships as sold.** Modernisations (current model tiers, full hook lifecycle, MCP transports, plan mode, `/context`) go silently into the teaching content. No TOC-review document.

---

## 6. Reference material not in this repo

| Item | Location |
|---|---|
| The full plan — per-day Teach/Demo/Exercise/Graded breakdown | `C:\Users\nitis\.claude\plans\i-have-this-toc-curried-lampson.md` |
| Client TOC spreadsheet | `C:\Users\nitis\Dropbox\...\Downloads\Claude_Code_Training_TOC (2).xlsx` |

**Copy both onto the new laptop separately** — they are outside this repo and will not come down with the clone. The plan file in particular is the specification for Days 2–7; without it you are rebuilding the day breakdown from scratch.

---

## 7. Locked decisions — do not relitigate

- Stack: Node 20 + TypeScript + Express + Jest/Supertest.
- Assessments are practical only, no multiple choice. Weights 30/25/20/15/10.
- Each day repo is self-contained (full app copy). One public repo per day, seven total.
- Orchestration: Opus specifies and verifies, Sonnet subagents write bulk content, a separate fresh agent verifies.

---

## 8. Known issues still open

| Issue | Severity |
|---|---|
| `capstone/starters/` is empty though `CAPSTONE.md` instructs teams to use it | must fix before Day 5 |
| Days 2–7 content not written | the main remaining work |
| `dist/` may exist in some day folders from local builds — gitignored, but delete before publishing | cosmetic |

## 9. Unrelated, but worth doing

The git remote at `C:\Users\nitis\workspace` has a GitHub personal access token embedded in its URL. Rotate that token and switch the remote to SSH or a credential helper before that repo goes anywhere.
