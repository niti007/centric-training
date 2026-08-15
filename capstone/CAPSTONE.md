# Capstone Project — Claude Code Training Programme

**Handed out**: end of Day 5 · **Built**: Day 7, Block 2 (3 hours) · **Presented**: Day 7, Block 3 (10 minutes per team)

Teams of 2–3. Pick **one** track.

---

## The scenario

TaskFlow is a task-management API used internally by three product teams. Compliance has mandated a new capability — **recurring tasks** — with a hard deadline. Your team has three hours, and the QA engineer who normally gates releases is on leave.

The business constraint that matters: **nothing ships without tests and a review**, and there is nobody available to do either by hand. Whatever you build has to close that gap using Claude Code itself.

This is not a toy prompt. Treat the three hours as a real sprint: scope deliberately, cut early, ship something that runs.

---

## The feature (shared across all tracks)

**Recurring tasks.** A task may carry a recurrence rule. When a recurring task is completed, the next occurrence is created automatically.

Minimum behaviour:

| Aspect | Requirement |
|---|---|
| Field | `recurrence` on a task: `null`, `"daily"`, `"weekly"`, or `"monthly"` |
| On complete | Completing a recurring task creates the next occurrence with the due date advanced by the interval |
| Chaining | The new occurrence inherits title, owner, cost, and recurrence; it does **not** inherit completion state |
| Validation | An unknown recurrence value is rejected with the repo's standard error envelope |
| Endpoint | `PATCH /tasks/:id/complete` handles the recurrence side effect |
| Edge case | Month-end rollover — completing a monthly task due Jan 31 must not silently produce Feb 31 |

That last row is where most teams' implementations break. It is deliberate.

---

## Track A — Feature Development + Test Automation

*Dev-focused. Pick this if your team wants breadth across the whole delivery loop.*

### Mandatory deliverables
1. Recurring tasks implemented end-to-end, using Claude Code for the implementation.
2. Unit tests for the recurrence logic, including the month-end rollover case.
3. Integration tests for `PATCH /tasks/:id/complete` covering both recurring and non-recurring paths.
4. A CI pipeline (`.github/workflows/`) that runs Claude Code in **headless mode** on push and fails the build on a critical finding.
5. A sub-agent review team (security + performance + style) run against your own diff, with the consolidated output committed as `REVIEW.md`.
6. The whole workflow packaged as an installable plugin.

### Stretch
- Plugin installs cleanly into a second, unrelated repository and its commands still work.
- CI comments findings back onto the pull request.

### Explicitly out of scope
Persistence layer changes, authentication rework, a UI, timezone-aware recurrence beyond the month-end case.

### Definition of done
`npm test` green, CI run visible and passing on a clean branch and failing on a seeded-bad branch, `REVIEW.md` present with real findings, plugin installs.

---

## Track B — QA Automation Suite

*QA-focused. Pick this if your team wants depth on verification.*

### Mandatory deliverables
1. A coverage-gap analysis of the existing codebase, written up as `COVERAGE-GAPS.md` — what is untested, ranked by risk, with reasoning.
2. A comprehensive test suite: unit + integration + regression. Regression tests must lock behaviour that currently exists, not just the new feature.
3. A working `/qa-report` slash command that produces a structured report (coverage, failures, gaps) to a file in a fixed schema.
4. A post-commit hook that runs the test suite automatically and flags failures.
5. A **live debugging demo**: take one failing test, triage it with Claude Code end to end, and show the fix. Rehearse this — it is the centrepiece of your presentation.

### Stretch
- Recurrence feature implemented test-first (you write the red tests, Claude makes them green).
- Report includes a trend line across two runs.

### Explicitly out of scope
Load/performance testing, mutation testing, E2E browser testing.

### Definition of done
Coverage measurably improved with a before/after number, `/qa-report` runs and emits a valid report, hook demonstrably fires, debugging demo runs live without editing anything mid-demo.

---

## Track C — Full-Stack Agentic Workflow

*Advanced, dev + QA. Pick this only if your team was comfortable through Day 6. It is the highest-ceiling and highest-risk track.*

### Mandatory deliverables
1. A multi-agent pipeline: **planner → developer → QA agent**, each with scoped tools and a defined handoff.
2. GitHub MCP connected: the pipeline reads a real issue from your repo, commits code, and opens a pull request.
3. Hooks for automated linting, test execution, and PR description generation.
4. A demonstrated full loop — **GitHub issue → working code → PR with tests** — with no manual intervention between issue and PR.
5. The recurring-tasks feature is the issue you feed it.

### Stretch
- The QA agent rejects the developer agent's first attempt and the loop self-corrects.
- Pipeline runs headlessly from CI rather than from an interactive session.

### Explicitly out of scope
Auto-merging to main (open the PR; a human merges), multi-repo orchestration, custom model fine-tuning.

### Definition of done
One command or trigger takes an issue number and produces a PR containing the feature plus passing tests, and you can run it live in front of the room.

---

## Constraints (all tracks)

Every team must demonstrably use:

- at least one **Skill** (`SKILL.md`)
- at least one **hook**
- at least one **sub-agent**
- **headless mode** (`claude -p`) somewhere in the loop
- **plan mode** for at least one non-trivial change

And must observe:

- Scoped permissions — no unrestricted `--allowedTools` or blanket accept-all in anything you ship.
- No secrets in `CLAUDE.md`, committed config, or CI logs.
- Every AI-generated change verified before it lands. You will be asked how.

Time: 3 hours build, hard stop. Teams of 2–3.

---

## Submission

Open a pull request to the branch `capstone/<team-name>` containing your work plus a `SUBMISSION.md`:

```markdown
# <Team name> — Track <A|B|C>

## What we built
Two paragraphs. What works, what doesn't, what we cut and why.

## Claude Code features used
Feature-by-feature: what we used, where it is in the repo, what it bought us.

## What Claude got wrong, and how we caught it
At least two concrete instances. The wrong output, how it surfaced,
and what caught it — a test, a review agent, a hook, or a human reading.

## What we'd do with another day
```

The third section is not optional and is not a formality. A team that reports Claude got nothing wrong has not been looking, and will be marked down on Best Practices accordingly.

---

## Rubric

| Criterion | Weight | Observable evidence |
|---|---|---|
| **Functionality** | 30% | The mandatory deliverables work. Month-end edge case handled. Demo runs live without repair. Partial credit for a working subset honestly scoped. |
| **Tool usage** | 25% | Skills, hooks, sub-agents, headless mode and plan mode used appropriately — not bolted on to tick the box. Tool choice fits the problem. |
| **Code quality** | 20% | Follows repo conventions (validation helper, error envelope, layering). Tests are meaningful, not tautological. Readable diffs. |
| **Presentation** | 15% | 10 minutes, well-rehearsed, shows the loop rather than describing it. Handles questions. Honest about limitations. |
| **Best practices** | 10% | Scoped permissions, no secrets, verification story is real and specific in `SUBMISSION.md`. |

Notes on marking:
- A polished demo of a small honest scope beats a broken demo of an ambitious one.
- Tests that pass whether or not the fix is present score zero on code quality for that item.
- "We used a sub-agent" with no evidence in the repo does not count as tool usage.

---

## Demo script template

Ten minutes goes fast. Use this shape:

| Time | Segment |
|---|---|
| 0:00–1:00 | **Track and scope.** What you chose, what you deliberately cut. |
| 1:00–2:00 | **The problem.** Why the workflow you built was needed. Skip the intro to TaskFlow — everyone knows it. |
| 2:00–6:00 | **Live demo.** Run the loop. Do not narrate code on screen; show it working. Have a recorded fallback. |
| 6:00–8:00 | **Under the hood.** The one or two Claude Code features that did the heavy lifting, and the config that made them work. |
| 8:00–9:00 | **What Claude got wrong.** Your best catch. This is the segment the room learns most from. |
| 9:00–10:00 | **Q&A.** |

Practical advice, learned the hard way:
- Run your demo end to end at least once before you present. Live agent runs are non-deterministic.
- Have a fallback recording or committed output for anything that calls a model live.
- Do not start your demo with an install step.

---

## Starters

`capstone/starters/option-a`, `option-b`, `option-c` contain a minimal scaffold per track so that three hours is enough. Use them — teams that start from an empty directory do not finish.
