# Claude Code Training — Day-by-Day Content, Demos & Exercises

## Context

Client TOC (`Claude_Code_Training_TOC (2).xlsx`, Great Learning for Business): 7 days, 22 hrs (5 × 2hr weekday + 2 × 6hr weekend), audience = Engineers, ends in a capstone. TOC has modules + objectives only — **no teaching content, no demos, no exercises, no assessments**.

This plan produces, per day: what the trainer **teaches**, what they **demo live**, what learners **do**, and the **graded practical** (no MCQs, per user decision). Every bullet in the client TOC is mapped so nothing sold goes undelivered. Sample app = **TaskFlow API** (Node 20 + TypeScript + Express + Jest), one repo carried across all 7 days.

Build order: Day 1 content first, reviewed, then Day 2, etc. — user wants to go day by day.

---

## Shared foundation (build once, before Day 1)

**Repo `claude-code-training`** — local at `C:\Users\nitis\workspace\claude-code-training`.

TaskFlow API — small but deliberately messy, so refactor/test/debug/review labs have real material:

```
src/
  index.ts                    express bootstrap
  routes/{tasks,users,auth}.ts
  services/{taskService,userService,notifyService}.ts
  repo/taskRepo.ts            in-memory store
  legacy/reportBuilder.ts     ~300-line god function  → Day 2 refactor target
  util/{validate,dates,money}.ts
tests/                        sparse on purpose — the Day 3 lesson
scripts/verify-setup.mjs      Day 1 auto-check
scripts/grade/day-N.mjs       per-day grader
labs/day-N/LAB.md
assessments/day-N/{TASK.md,RUBRIC.md}
capstone/
```

**Seeded defects** (documented only in `INSTRUCTOR.md`, on the `instructor` branch):
1. Off-by-one in `taskService.list` pagination → Day 3
2. Timezone bug in `util/dates.ts` due-date compare → Day 3 debugging
3. Float arithmetic in `util/money.ts` → Day 3 regression
4. Missing authz on `PATCH /tasks/:id` → Day 6 security agent
5. N+1 query in `reportBuilder` → Day 6 perf agent
6. Unsanitized user string in notification template → Day 7 security block

**Branches**: `day-1-start` … `day-7-start` (each = prior day's solution, so stragglers reset forward), `solutions/day-N`, `instructor`.

**Rubric weights, all graded work** (matches what TOC already sold): Functionality 30 / Tool usage 25 / Code quality 20 / Presentation 15 / Best practices 10.

---

# Day 1 — Introduction & Foundation (2 hrs, weekday)

**TOC objective**: install & configure; product ecosystem, permission model, CLAUDE.md, context window basics.

### Teach (0:00–1:00)
| Block | Content | Covers TOC bullet |
|---|---|---|
| 10 min | What Claude Code is: agentic CLI, not autocomplete. Architecture — model + tool loop (Read/Write/Edit/Bash/Grep/Glob) + permission layer. Positioning vs Copilot/Cursor: terminal-native, multi-file, runs commands. | "What is Claude Code? capabilities, architecture, positioning" |
| 10 min | Ecosystem map: Claude.ai (chat) vs Claude Code (agent in your repo) vs API/Agent SDK (build your own). When to reach for which. | "Claude Code vs Claude.ai vs the API" |
| 10 min | Install & auth: Node 20+, `npm i -g @anthropic-ai/claude-code`, subscription login vs `ANTHROPIC_API_KEY`, where config lives (`~/.claude/`, project `.claude/`). | "Installation and environment setup" |
| 10 min | Modes: interactive REPL, headless `claude -p`, **plan mode** (Shift+Tab) — *promoted from a footnote, it's the core safe-work habit*. Also `--continue` / `--resume`. | "Launching Claude Code — modes overview" |
| 10 min | Permission system: allow/deny/ask, `settings.json` permissions, `--allowedTools`, why "accept all" is a production incident waiting to happen. | "Permission system" |
| 10 min | CLAUDE.md: what it is, hierarchy (enterprise → user `~/.claude` → project → subdirectory), `@import`, what belongs in it vs what doesn't. Context window basics: what gets loaded, `/context`, why a 5000-line CLAUDE.md is self-harm. | "CLAUDE.md", "Context window basics" |

### Demo live (1:00–1:20)
Clone TaskFlow, run `claude`, ask *"explain what this API does and where the task validation lives"* — narrate how it greps/reads rather than loading everything. Then `/context`. Then a first edit in plan mode: add a `GET /health` route — show plan → approve → diff → permission prompt on Bash.

### Learner exercise (1:20–1:50) — `labs/day-1/LAB.md`
1. Install, auth, `git clone`, `npm ci`, `npm test` (some tests fail — that's expected, note which).
2. `node scripts/verify-setup.mjs` → must print all-green.
3. Ask Claude 3 orientation questions about the codebase; record answers in `NOTES.md`.
4. Make first edit **in plan mode**: add `GET /tasks/:id/summary` returning `{id,title,dueIn}`.
5. Write `CLAUDE.md` with required sections: Commands, Architecture, Conventions, Do-Not-Touch.
6. Configure `.claude/settings.json`: allow `npm test`/`npm run lint`, deny `rm`, ask on `git push`.

### Graded practical — `assessments/day-1/`
**Task**: "Make Claude follow *our* conventions without being told in-chat." Author CLAUDE.md + settings.json such that a scripted prompt (`claude -p "add a DELETE /tasks/:id route"`) produces code matching repo conventions (error shape, validation util, test alongside).
**Grader** `scripts/grade/day-1.mjs`: CLAUDE.md has the 4 required sections; settings.json valid + contains deny rule; verify-setup green; generated route uses `util/validate` and the repo's error envelope.

### Trainer notes
Biggest time sink is auth/proxy on corporate laptops. Send SETUP.md 48 hrs early; keep a `--no-install` fallback (web/IDE) for anyone blocked.

---

# Day 2 — Core Developer Workflows & Code Generation (2 hrs)

**TOC objective**: conversation-driven coding, file ops, generation, refactoring, docs, context management.

### Teach (0:00–0:50)
- **Conversation-driven coding** — specificity beats politeness. Anti-patterns: "make it better", no acceptance criteria, no file pointers. Pattern: *goal + constraints + where + how to verify*.
- **File operations** — Read/Write/Edit/MultiEdit; how Claude finds things (Grep/Glob) and why naming matters more with agents.
- **Bash execution** — running builds/tests/package managers; background tasks for long-running servers; reading failures back into the loop.
- **Code generation** — feature from a natural-language spec; why you give it the test first.
- **Refactoring** — behavior-preserving changes, characterization tests before touching legacy.
- **Documentation generation** — inline comments, README, API docs from routes.
- **Context management** — `/context`, `/compact` (and what compaction loses), `/clear`, auto-compaction, checkpoints & rewind, `--resume`. *Added beyond TOC: checkpointing, `/context`.*
- **Model selection** — Opus / Sonnet / Haiku tiers by task cost-vs-capability; `/model`; fast mode. *TOC says "Opus 4 vs Sonnet 4" — teach tier-generic, deck must be updated (see TOC-REVIEW).* Include `/cost`.

### Demo live (0:50–1:10)
Take `legacy/reportBuilder.ts`. Show the wrong way (one vague prompt → sprawling diff), then the right way: characterization test first → plan mode → incremental extraction → tests stay green. Show `/compact` mid-session and what survives.

### Learner exercise (1:10–1:45)
1. Generate `POST /tasks/bulk` from a written spec supplied in the lab.
2. Generate JSDoc + a README API table for `routes/tasks.ts`.
3. Refactor `util/money.ts` for readability *without* changing behavior; prove it with the existing test.
4. Deliberately blow up context: read 10 files, run `/context`, `/compact`, compare token counts, note what was lost.
5. Run the same task on two model tiers; record time/cost/quality in `NOTES.md`.

### Graded practical
**Task**: Refactor `legacy/reportBuilder.ts` into ≥3 tested units, behavior-preserving.
**Grader**: snapshot/characterization tests still pass; each extracted unit < 60 LOC; no new deps; `git diff --stat` touches only allowed paths; new unit tests exist and pass.

---

# Day 3 — QA Workflows & Testing Automation (2 hrs)

**TOC objective**: unit/integration tests, TDD, debugging, code review, output verification, regression automation.

### Teach (0:00–0:50)
- **How AI changes QA** — generation is cheap, *verification* is now the scarce skill. Coverage theatre vs meaningful assertions.
- **Unit test generation** — function → suite; edge cases, boundary values, error paths; making Claude enumerate cases before writing.
- **Integration tests** — Supertest against the Express app; fixtures, test data, isolation.
- **TDD with Claude Code** — red/green/refactor where you own the red. Why tests-first is the single highest-leverage guardrail with agents.
- **Debugging workflows** — reproduce → isolate → hypothesize → verify. Feeding stack traces and failing output back in.
- **Code review with Claude Code** — asking for structured review (correctness / security / perf), not "looks good?".
- **Verifying AI output** — the TOC's "1.75× logic error risk" bullet: reframe as *AI output is plausible-by-construction*; teach the checks (does the test actually fail without the fix? is the assertion tautological? did it delete the hard case?).
- **Regression automation** — locking behavior before change; snapshot discipline.

### Demo live (0:50–1:10)
Live-debug seeded defect #2 (timezone due-date). Show Claude confidently proposing a wrong fix, then catching it by writing the failing test first. This is the emotional beat of the whole course — do not skip it.

### Learner exercise (1:10–1:45)
1. Generate a unit suite for `services/taskService.ts`; find seeded defect #1 (pagination off-by-one).
2. Integration tests for `routes/tasks.ts` via Supertest — happy path + 4xx paths.
3. TDD a new feature (`PATCH /tasks/:id/complete`) — test first, no implementation until red.
4. Debug seeded defect #3 (money float) and add a regression test.
5. Run a structured code review on your own Day 2 refactor; log what Claude flagged and whether it was right.

### Graded practical
**Task**: `services/` coverage ≥ 80% and both seeded bugs #1 and #3 fixed with regression tests.
**Grader**: `jest --coverage` thresholds; hidden bug-specific tests now pass; anti-cheat — assert tests actually fail when the fix is reverted.

---

# Day 4 — Slash Commands, Skills & Customisation (2 hrs)

**TOC objective**: custom slash commands, SKILL.md, `.claude/` organisation, sharing, progressive disclosure.

### Teach (0:00–0:50)
- **Slash commands** — built-in (`/init`, `/review`, `/compact`, `/context`, `/model`, `/agents`) vs custom.
- **Creating custom commands** — `.claude/commands/name.md`, frontmatter (`description`, `argument-hint`, `allowed-tools`), `$ARGUMENTS`, `!` bash pre-execution, `@` file refs. Project vs personal scope.
- **Skills (SKILL.md)** — `.claude/skills/<name>/SKILL.md`, frontmatter `name` + `description`, bundled reference files and scripts.
- **Auto-activation** — the `description` field *is* the trigger; how to write one that fires reliably; commands (explicit) vs skills (model-invoked).
- **Organising `.claude/`** — commands / skills / agents / rules / settings; what to commit vs `.local.json`.
- **Sharing across projects & teams** — git-committed `.claude/`, personal `~/.claude/`, precedence.
- **Progressive disclosure** — keep CLAUDE.md lean; push detail into skills loaded on demand. *Added: `.claude/rules` and CLAUDE.md precedence; output styles / `--append-system-prompt`.*
- **Practical patterns** — walk through `/deploy`, `/review`, `/test`, `/security-check` shapes.

### Demo live (0:50–1:10)
Build `/qa-report` from scratch: frontmatter → bash pre-step running coverage → templated output. Run it. Then build a skill that auto-fires when someone says "add an endpoint".

### Learner exercise (1:10–1:45)
1. Build `.claude/commands/review.md` — structured review of staged diff, `allowed-tools` scoped to read+git.
2. Build `.claude/commands/qa-report.md` — emits `reports/qa-<date>.md` in a fixed schema.
3. Build `.claude/skills/api-endpoint/SKILL.md` — encodes this repo's route+validate+test convention. Test auto-activation without naming it.
4. Slim CLAUDE.md by moving detail into skill files; verify behavior unchanged.
5. Swap `.claude/` dirs with a partner and confirm their command runs unmodified.

### Graded practical
**Task**: Ship a working `/qa-report` command + one auto-activating SKILL.md.
**Grader**: files exist, frontmatter parses, `description` non-generic; running the command produces a report matching the required schema; a scripted prompt that never names the skill still triggers the convention (checked via output shape).

---

# Day 5 — Hooks, Automation & CI/CD (2 hrs)

**TOC objective**: pre/post-tool hooks, headless mode, GitHub Actions / Azure DevOps, restrictive permissions, PR review automation, **capstone brief handed out**.

### Teach (0:00–0:50)
- **Hooks overview** — full lifecycle, not just pre/post-tool: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStop`, `Notification`. *TOC lists only pre/post — expand.*
- **Config shape** — `settings.json` `hooks` block, matchers, command contract, exit codes (0 pass / 2 block), JSON stdin/stdout, blocking vs advisory.
- **Background hooks** — non-blocking notifications and long jobs.
- **Use cases** — lint/format on write, test-on-write, secret-scan before edit, desktop notify on Stop.
- **Headless mode** — `claude -p`, `--output-format json`, exit codes, piping, non-TTY gotchas.
- **CI/CD** — GitHub Actions workflow running Claude Code on PRs; Azure DevOps equivalent; secrets handling; cost controls (only changed files, only on label).
- **`--allowedTools` in automation** — least privilege; why CI must never get Write+Bash unscoped.
- **Automated PR review** — posting structured findings back to the PR.
- **Capstone brief** — hand out `capstone/CAPSTONE.md`, form teams, pick track. *(TOC puts this on Day 5 — keep it, ~15 min.)*

### Demo live (0:50–1:05)
Wire a PostToolUse hook that runs ESLint --fix on every written `.ts`. Break it on purpose (exit 2) and show the block. Then run `claude -p "review this diff"` headless and show JSON output.

### Learner exercise (1:05–1:40)
1. PostToolUse hook: lint-on-write.
2. PreToolUse hook: block any Write containing an API-key-shaped string (exit 2 + message).
3. Stop hook: desktop/terminal notification.
4. Headless: `claude -p` review of a diff, `--output-format json`, parse the result in a script.
5. `.github/workflows/claude-review.yml` — runs on PR, `--allowedTools` restricted to Read/Grep/Glob, fails the build on a critical finding.

### Graded practical
**Task**: Working lint hook + headless CI workflow that fails on a bad PR.
**Grader**: grader writes a violating file → asserts hook blocked or fixed it; workflow YAML validates; seeded-violation branch → `claude -p` run exits non-zero; clean branch → exits 0.

---

# Day 6 — MCP, Sub-agents & Plugins (6 hrs, weekend intensive)

**TOC objective**: three blocks — MCP, sub-agents/agent teams, plugins/production patterns.

### BLOCK 1 — MCP (2 hrs)
**Teach**: what MCP is and why a protocol beats bespoke integrations; server capabilities (tools/resources/prompts); **transports — stdio vs HTTP/SSE, remote servers + OAuth** *(missing from TOC, add)*; scopes (`local` / `project` `.mcp.json` / `user`); `claude mcp add|list|remove`; first-party connectors (GitHub, Slack, Drive, Jira); **security** — auditing servers, vetting community plugins, supply-chain risk, **and prompt injection via malicious tool descriptions / untrusted content** *(add)*; smart loading — every server's tools eat context, enable on demand.

**Demo**: connect GitHub MCP, read a real issue, have Claude open a PR.

**Exercise**: (a) configure GitHub MCP in project scope; (b) write a tiny local stdio MCP server exposing one TaskFlow tool (`list_overdue_tasks`) and connect it; (c) measure `/context` before/after enabling 3 servers and write down the cost.

### BLOCK 2 — Sub-agents & Agent Teams (2 hrs)
**Teach**: isolated context windows and why that's the point; `.claude/agents/*.md` frontmatter (`name`, `description`, `tools`, `model`); `/agents`; when to delegate (fan-out search, independent review passes, long noisy output) vs when not to (tight iterative work — handoff cost); agent teams — parallel specialists; orchestration patterns — planner → workers → synthesizer; context management across the hierarchy; cost implications (each agent is a fresh cold context).

**Demo**: spawn security + performance + style reviewers in parallel on `reportBuilder.ts`; show them surfacing different classes of finding.

**Exercise**: build the 3 reviewer agents with scoped tools (read-only), run them on the repo, and produce a consolidated review. **They must surface seeded defects #4 (missing authz) and #5 (N+1).** Then build a planner→implementer→reviewer chain for one small feature.

### BLOCK 3 — Plugins & Production Patterns (1.5 hrs) + wrap (0.5 hr)
**Teach**: plugins bundle commands + skills + hooks + agents + MCP configs; manifest structure, namespacing, versioning; marketplace vs local install; production patterns — permission scoping, error handling, audit logging; memory deep-dive — CLAUDE.md hierarchy + `.claude/rules` precedence.

**Demo**: package everything built on Days 4–6 into `taskflow-kit` and install it into a *different* repo.

**Exercise**: package + install into a clean repo; verify a command and a hook from the plugin work there.

> **Timing risk**: 3 blocks in 6 hrs is tight. Mitigation: pre-provide the plugin scaffold so Block 3 is fill-in-the-blanks, and pre-provide the MCP server skeleton in Block 1.

### Graded practical
**Task**: 3-agent review team + a working MCP connection; review must surface defects #4 and #5.
**Grader**: agent files valid with scoped tools; `.mcp.json` valid; review artifact names both defect locations; plugin manifest validates and installs.

---

# Day 7 — Best Practices, Capstone & Graduation (6 hrs, weekend intensive)

### BLOCK 1 — Best Practices Deep Dive (1.5 hrs)
- **Security** — permission scoping in real teams, `--allowedTools`, secret management (never in CLAUDE.md, hooks as a secret gate), handling untrusted repo content. Walk seeded defect #6 (unsanitized notification template) as the case study.
- **Output verification** — the pre-merge checklist; what to never accept unreviewed (auth, migrations, money, deletes).
- **Prompt engineering for Claude Code** — specificity, context, acceptance criteria, plan-mode-first.
- **Context hygiene** — monitoring with `/context`, `/compact` strategy, when to reset, checkpoints.
- **Team adoption** — sharing CLAUDE.md/skills/plugins, review norms for agent-authored PRs, onboarding a new dev in a day.
- *Added*: cost governance (`/cost`, model routing) and a pointer to the **Claude Agent SDK** for teams going beyond the CLI.

### BLOCK 2 — Capstone Build (3 hrs)
Teams of 2–3 build their chosen track. Trainer circulates. 30-min checkpoint at the halfway mark to catch teams that scoped too big.

### BLOCK 3 — Presentations & Wrap (1.5 hrs)
10-min demos + peer Q&A; programme summary; roadmap/next steps; feedback; certificates.

### Capstone statement — `capstone/CAPSTONE.md`
Scenario: TaskFlow team must ship **recurring tasks** under a compliance deadline, with a QA gate and no manual review capacity.

- **Track A — Feature Dev + Test Automation**: implement the feature, unit + integration tests, headless CI on push, 3-agent review, package as a plugin.
- **Track B — QA Automation Suite**: coverage-gap analysis doc, full suite (unit + integration + regression), `/qa-report` command, post-commit hook auto-running tests, live failing-test triage demo.
- **Track C — Full-Stack Agentic (advanced)**: planner → developer → QA agent pipeline + GitHub MCP; GitHub issue → code → PR with tests, zero manual steps; hooks for lint/test/PR-description.

Common constraints: 3 hrs, teams of 2–3, must use ≥1 skill, ≥1 hook, ≥1 sub-agent, and headless mode. Each track gets mandatory deliverables, stretch goals, explicit out-of-scope, and a definition of done.

**Submission**: PR to `capstone/<team>` + `SUBMISSION.md` covering what you built, which Claude Code features you used, and **what Claude got wrong and how you caught it** (this lands the verification lesson).

**Rubric**: 30/25/20/15/10 expanded into observable per-track criteria. Plus a demo-script template so teams don't burn their 10 minutes flailing.

---

> Note: TOC stays as sold. Modernizations above (current model tiers, full hook lifecycle, MCP transports, plan mode, `/context`) are applied **silently inside the teaching content** — no separate TOC-review document is produced.

---

---

# Execution — folders, orchestration, GitHub

## Local layout
Root: `C:\Users\nitis\centric-training`

```
centric-training/
├─ README.md                     # programme index, links all 7 repos
├─ INSTRUCTOR.md                 # defect map, timings, answer keys (never pushed to day repos)
├─ capstone/CAPSTONE.md          # + starters/{option-a,option-b,option-c}
└─ day1/ … day7/                 # each a SELF-CONTAINED repo root
     ├─ README.md                # day overview, objectives, how to start
     ├─ LAB.md                   # step-by-step exercise, timeboxed to TOC blocks
     ├─ TEACH.md                 # trainer script: what to teach, live demo steps, talking points
     ├─ ASSESSMENT.md            # graded practical task
     ├─ RUBRIC.md                # 30/25/20/15/10 criteria
     ├─ SETUP.md                 # day-1 only heavy; others short
     ├─ package.json / tsconfig.json / jest.config.ts / eslint.config.mjs
     ├─ src/ tests/              # TaskFlow API at THAT day's starting state
     ├─ .claude/                 # accumulated artifacts up to that day
     ├─ .github/workflows/       # empty until day5
     └─ scripts/{verify-setup.mjs,grade.mjs}
```

Each `dayN/` is a full standalone repo root — day2's `src/` = day1's solution, day3's = day2's solution, etc. Learner clones exactly one repo per day.

## GitHub
7 **public** repos under `niti007`:

| Repo | Day |
|---|---|
| `centric-cc-day1-foundation` | Introduction & Foundation |
| `centric-cc-day2-dev-workflows` | Core Dev Workflows & Code Generation |
| `centric-cc-day3-qa-testing` | QA Workflows & Testing Automation |
| `centric-cc-day4-commands-skills` | Slash Commands, Skills & Customisation |
| `centric-cc-day5-hooks-cicd` | Hooks, Automation & CI/CD |
| `centric-cc-day6-mcp-agents-plugins` | MCP, Sub-agents & Plugins |
| `centric-cc-day7-capstone` | Best Practices & Capstone |

Created with `gh repo create <name> --public --source=dayN --push` (auth verified: `niti007`, scopes `repo`,`workflow` — workflow files can be pushed). Each gets a description + topics (`claude-code`, `training`, `dayN`). `INSTRUCTOR.md` and answer keys stay **local only**, excluded via `.gitignore`.

## Orchestration (Opus = orchestrator, Sonnet = workers)

Opus writes no bulk content — it specifies, dispatches, and verifies.

**Wave 0 (Opus, inline)**: create `centric-training/`, write `README.md` and `INSTRUCTOR.md` (defect map + timings + answer keys). These are the spec every worker reads.

**Wave 1 — foundation (1 Sonnet builder)**: build the canonical TaskFlow API + tooling + all 6 seeded defects + `solutions/` states for days 1→7 inside a staging dir. This is sequential and must land before day folders exist.

**Wave 2 — day content (Sonnet builders, batched 3 at a time)**: each worker gets one day; receives that day's section of this plan verbatim, the app state from Wave 1, and a strict file manifest. Produces `README/TEACH/LAB/ASSESSMENT/RUBRIC/scripts/grade.mjs` + the `.claude/` artifacts for that day. Batches: (day1,day2,day3) → (day4,day5,day6) → (day7 + capstone).

**Wave 3 — verification (separate Sonnet verifier agent, fresh context)**: does NOT see the builder's reasoning. Runs the checks below per day and returns a pass/fail table. Any fail → Opus dispatches a targeted fix worker, then re-verifies.

**Wave 4 (Opus)**: `git init` + initial commit per day folder, create the 7 repos, push, set descriptions/topics, then final read of the live repos.

Checkpoint with user after Wave 1 and after each Wave-2 batch.

## Verification (Sonnet verifier agent, per day repo)
- `npm ci && npm run build && npm test` — day1..day7 each behave as documented (day1 has known-failing tests *by design*; verifier asserts the exact expected failure set, not "all green").
- `node scripts/grade.mjs` **fails** on the day's starting state and **passes** on that day's solution — proves graders discriminate.
- No `INSTRUCTOR.md`, no answer keys, no `solutions/` inside any day folder.
- Every TOC bullet for that day appears in `TEACH.md` (checklist cross-reference).
- LAB.md timings sum to 2 hrs (day1–5) / 6 hrs (day6–7).
- Day 5: seeded-violation branch → `claude -p` exits non-zero; clean → 0. Workflow YAML parses.
- Day 6: `.mcp.json` and `.claude/agents/*.md` parse; agent tool scopes are read-only.
- Post-push: `gh repo view <name>` returns public, correct description, and `git clone` into a temp dir + `npm ci && npm test` reproduces locally.

## Out of scope
Slide decks/PPT, LMS/SCORM packaging, changes to `niti007/Ai-Builder`.

## Unrelated but worth doing
`C:\Users\nitis\workspace` git remote embeds a GitHub PAT (`ghp_…`). Rotate the token; switch remote to SSH or a credential helper.
