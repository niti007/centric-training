# Capstone Track Build — Context

**Read this file in full before doing anything else.** It's written so a fresh Claude Code session, with no memory of any prior conversation, can pick one track and build a complete, working implementation end to end.

This doc is shared across all three tracks. Three separate build sessions will each read it and build one track — pick the one you've been assigned and skip the other two track sections.

---

## What this is

The Claude Code training programme (`niti007/centric-training`, private repo) ends in a capstone: teams pick one of three tracks and build it against the **TaskFlow API** in three hours. This repo doesn't yet contain a completed capstone submission for any track — only the brief and a minimal starter scaffold per track. That's what you're building now: a real, working reference implementation.

- **Full brief** (read this next, in full): [`capstone/CAPSTONE.md`](https://github.com/niti007/centric-training/blob/main/capstone/CAPSTONE.md) — local path `capstone/CAPSTONE.md`
- **Repo root**: local `/Users/tarunsachdeva/centric/centric-training`, GitHub `https://github.com/niti007/centric-training` (private)
- **This file**: `capstone/BUILD-CONTEXT.md` — [GitHub link](https://github.com/niti007/centric-training/blob/main/capstone/BUILD-CONTEXT.md)

---

## The shared feature every track builds

**Recurring tasks** on the TaskFlow API. A task may carry a recurrence rule.

| Aspect | Requirement |
|---|---|
| Field | `recurrence` on a task: `null`, `"daily"`, `"weekly"`, or `"monthly"` |
| On complete | Completing a recurring task creates the next occurrence with the due date advanced by the interval |
| Chaining | The new occurrence inherits title, owner, cost, and recurrence; it does **not** inherit completion state |
| Validation | An unknown recurrence value is rejected with the repo's standard error envelope |
| Endpoint | `PATCH /tasks/:id/complete` handles the recurrence side effect |
| Edge case | Month-end rollover — completing a monthly task due Jan 31 must not silently produce Feb 31. This is deliberate; most implementations break here. |

Full detail, rubric, submission format, and demo script template are all in `capstone/CAPSTONE.md` — this section is just a summary, don't build from this summary alone.

---

## Set up your working copy — do this first

The `day7/` folder in this repo is **already published** as its own public GitHub repo (`centric-cc-day7-capstone`) and has its own nested `.git` — do not edit it directly. Instead:

```bash
mkdir -p ~/centric/centric-training/capstone/builds
cp -R ~/centric/centric-training/day7 ~/centric/centric-training/capstone/builds/<track-name>
rm -rf ~/centric/centric-training/capstone/builds/<track-name>/.git
rm -rf ~/centric/centric-training/capstone/builds/<track-name>/node_modules
rm -rf ~/centric/centric-training/capstone/builds/<track-name>/dist
```

Then copy your track's starter scaffold on top (it won't clobber anything — the starters only add new files, they don't touch `src/`):

```bash
cp -R ~/centric/centric-training/capstone/starters/option-<a|b|c>/. ~/centric/centric-training/capstone/builds/<track-name>/
```

Then `cd` into `capstone/builds/<track-name>`, `npm install`, and confirm `npm test` passes (35/35, fully green — this is Day 7's finished state) before building anything.

Node 20 is required. If `node`/`npm` aren't on `PATH`, they're installed locally at `~/.local/node20` — run `export PATH="$HOME/.local/bin:$PATH"` first.

---

## Repo conventions — follow these in every track

(From `day7/CLAUDE.md`, carried through the whole programme.)

- Every route validates input through `src/util/validate.ts` before touching a service.
- Errors always return the envelope `{ error: { code, message, details? } }`.
- Services (`src/services/`) never import Express types. Pure functions over the in-memory repo.
- Routes never import from `src/repo/` directly — always go through a service.
- Every new source file gets a sibling test under `tests/`.
- Route handlers that read/modify a specific task must check `task.userId === req.userId` (ownership) — matching `GET /tasks/:id`, `DELETE /tasks/:id`, `POST /tasks/:id/complete`.
- Do not touch `tests/reportBuilder.characterization.test.ts` snapshots.
- `src/legacy/reportBuilder.ts` is out of scope — don't "clean it up" incidentally.

---

## Track A — Feature Development + Test Automation

Starter: `capstone/starters/option-a/` (stub `src/util/recurrence.ts`, `it.todo`-only test skeleton, CI workflow with a TODO review step, plugin pointer).

**Mandatory deliverables**:
1. Recurring tasks implemented end-to-end.
2. Unit tests for the recurrence logic, including month-end rollover.
3. Integration tests for `PATCH /tasks/:id/complete`, both recurring and non-recurring paths.
4. A CI pipeline (`.github/workflows/`) running Claude Code in **headless mode** on push, failing the build on a critical finding.
5. A sub-agent review team (security + performance + style) run against your own diff, consolidated output committed as `REVIEW.md`.
6. The whole workflow packaged as an installable plugin.

**Stretch**: plugin installs cleanly into a second repo; CI comments findings on the PR.
**Out of scope**: persistence changes, auth rework, UI, timezone-aware recurrence beyond month-end.
**Definition of done**: `npm test` green, CI passes clean/fails seeded-bad, `REVIEW.md` present with real findings, plugin installs.

---

## Track B — QA Automation Suite

Starter: `capstone/starters/option-b/` (`COVERAGE-GAPS.md` template, skeleton `/qa-report` command, skeleton post-commit hook).

**Mandatory deliverables**:
1. Coverage-gap analysis written up as `COVERAGE-GAPS.md` — ranked by risk, with reasoning.
2. Comprehensive test suite: unit + integration + regression (regression tests must lock *existing* behavior, not just the new feature).
3. A working `/qa-report` slash command producing a structured report (coverage, failures, gaps) to a fixed-schema file.
4. A post-commit hook that runs the test suite automatically and flags failures.
5. A **live debugging demo**: take one failing test, triage it with Claude Code end to end, show the fix.

**Stretch**: recurrence implemented test-first; report includes a trend line across two runs.
**Out of scope**: load/performance testing, mutation testing, E2E browser testing.
**Definition of done**: coverage measurably improved with a before/after number, `/qa-report` runs and emits a valid report, hook demonstrably fires, debugging demo runs live.

---

## Track C — Full-Stack Agentic Workflow (advanced)

Starter: `capstone/starters/option-c/` (skeleton `planner`/`developer`/`qa` agents with correct tool scoping, `.mcp.json.example`, `PIPELINE.md` template).

**Mandatory deliverables**:
1. A multi-agent pipeline: **planner → developer → QA agent**, each with scoped tools and a defined handoff (design this in `PIPELINE.md`).
2. GitHub MCP connected: the pipeline reads a real issue, commits code, opens a PR.
3. Hooks for automated linting, test execution, and PR description generation.
4. A demonstrated full loop — **GitHub issue → working code → PR with tests** — no manual intervention.
5. The recurring-tasks feature is the issue fed to the pipeline.

**Stretch**: QA agent rejects the developer's first attempt and the loop self-corrects; pipeline runs headlessly from CI.
**Out of scope**: auto-merging to main (open the PR; a human merges), multi-repo orchestration, custom model fine-tuning.
**Definition of done**: one command/trigger takes an issue number and produces a PR with the feature plus passing tests, runnable live.

---

## Constraints — all three tracks

Every track must demonstrably use: at least one **Skill** (`SKILL.md`), at least one **hook**, at least one **sub-agent**, **headless mode** (`claude -p`) somewhere in the loop, and **plan mode** for at least one non-trivial change.

And must observe: scoped permissions (no unrestricted `--allowedTools` or blanket accept-all), no secrets in `CLAUDE.md`/committed config/CI logs, every AI-generated change verified before it lands (be ready to explain how).

---

## Submission

When done, write `SUBMISSION.md` in your build directory using this template (full detail in `CAPSTONE.md`):

```markdown
# <Track name> — Track <A|B|C>

## What we built
Two paragraphs. What works, what doesn't, what we cut and why.

## Claude Code features used
Feature-by-feature: what we used, where it is in the repo, what it bought us.

## What Claude got wrong, and how we caught it
At least two concrete instances — the wrong output, how it surfaced, what caught it.

## What we'd do with another day
```

The "what Claude got wrong" section is not optional — reporting nothing wrong reads as not having looked closely, and scores down on Best Practices.

**Rubric** (full descriptors in `CAPSTONE.md`): Functionality 30% / Tool usage 25% / Code quality 20% / Presentation 15% / Best practices 10%.

---

## Start-of-session checklist

1. Read this file in full (done, if you're reading this).
2. Read `capstone/CAPSTONE.md` in full — this doc only summarizes it.
3. Read your track's starter files under `capstone/starters/option-<a|b|c>/` — every file there has inline TODOs explaining what's left to design.
4. Set up your working copy per the "Set up your working copy" section above.
5. Confirm `npm test` is green (35/35) before changing anything.
6. Build the mandatory deliverables. Use Claude Code's own features (skill, hook, sub-agent, headless mode, plan mode) as you go — this is itself part of the exercise.
7. Write `SUBMISSION.md` when done.
