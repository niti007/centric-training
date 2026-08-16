# Day 7 — Trainer Script

6 hours, three blocks. This script covers **Block 1 in full** (1.5 hrs: roughly 50 minutes of teaching, then a hands-on exercise — see `LAB.md`). Blocks 2 and 3 are the capstone build and presentations; this file closes with short logistics notes for those, but the actual content lives in `capstone/CAPSTONE.md` and this file does not repeat it.

Read each block's talking points aloud in your own words, don't read verbatim — keep the sequence and the room questions. This is the last new material of the programme — treat Block 1 as the "everything you need before we turn you loose for three hours" briefing, not a leisurely lecture. Move with discipline; the room needs the full hands-on window that follows.

---

## BLOCK 1 — Best Practices Deep Dive (1:30)

### Teach (0:00–0:50)

**1a. Security — permission scoping in real teams, `--allowedTools` (0:00–0:08)**

- Every team that adopts Claude Code past a solo experiment hits the same question: what should it be allowed to do without asking, what should it always ask about, and what should it never be allowed to do at all. `.claude/settings.json`'s `allow` / `ask` / `deny` lists are that policy, in one file, reviewable in a PR like any other config.
- `--allowedTools` on the CLI is the same idea scoped to a single invocation — useful for a scripted or CI run where you want to grant exactly what that run needs and nothing left over from a broader default, rather than reusing a wide-open interactive session's permissions in an unattended context.
- The failure mode to name explicitly: a team that starts permissive ("just accept everything, we'll tighten it later") almost never tightens it later. The cheap moment to scope permissions is before the first real incident, not after.
- This repo's own `.claude/settings.json` is currently thin — two `allow` entries, one `deny` entry, one `ask` entry. That's roughly where a team's settings file looks on day one. Point at it live; the room hardens this exact file in the hands-on exercise.

**Ask the room**: "What's one Bash command your own team would want on a hard deny list, not just an ask list — something you'd never want an agent running even with a human glancing at the confirmation prompt?"

**1b. Secret management — never in `CLAUDE.md`, hooks as a gate (0:08–0:14)**

- `CLAUDE.md` and any committed config are read by the model and, more importantly, live in version control forever. A secret pasted into `CLAUDE.md` "so Claude has the API key" is a secret committed to git history — it doesn't matter that it was well-intentioned; it's now in every clone and every log of that repo.
- The correct pattern: secrets live in environment variables or a secrets manager, referenced by name, never by value, in anything Claude reads or writes.
- Hooks as a gate: a `PreToolUse` hook can inspect a Write/Edit before it lands and block it if it looks like it's about to commit a secret — this repo already ships `.claude/hooks/secret-block.mjs` wired into `PreToolUse` for exactly that reason. Point at it in `.claude/settings.json` live. A hook is enforcement, not a suggestion — it runs whether or not anyone remembers to look.

**1c. Handling untrusted repo content — case study: the notification service (0:14–0:26)**

- Not everything in a codebase is content you wrote. A task title, a task description, a user's display name — anything that ultimately came from an API request body — is user input, and user input is untrusted until it's been through validation or escaping appropriate to where it ends up. This applies whether a human or Claude is the one writing the code that handles it.
- Open `src/services/notifyService.ts` live. Walk through it with the room: `buildTaskAssignedNotification` builds an HTML notification body by interpolating `task.title`, `task.description`, and `user.name` directly into a template string — no escaping, anywhere. If a task title contains `<script>...</script>`, that markup goes straight into the notification's `html` field exactly as written.
- Ask the room to reason about the blast radius before you say it: this notification HTML presumably ends up rendered somewhere — an email client, an in-app notification panel, an admin dashboard. Anywhere it's rendered as HTML rather than shown as plain text, an attacker who controls a task title (any authenticated user, in this API) has a stored cross-site-scripting vector into whoever views that notification.
- Live-fix it in front of the room: prompt Claude Code to add HTML escaping for every user-supplied value before it's interpolated, and to preserve the existing plain-text behavior for values that don't contain anything dangerous. Watch what it proposes — a first pass sometimes escapes only the value it happens to be looking at (say, just the title) and misses that `description` and `user.name` are exactly the same risk in the exact same function. Call this out if it happens: point-fixing one interpolation while leaving three others is a common shape of "technically addressed the prompt, missed the actual pattern."
- Verify, don't trust the diff: write (or have Claude write) a test that constructs a task with a `<script>` tag in its title and asserts the resulting HTML does **not** contain the raw tag. Run it. Then — this is the point worth dwelling on — show what happens if you temporarily revert the fix: the test should go red. A regression test that would pass whether or not the bug is fixed isn't proving anything; this is the same discipline the room has now seen applied to bug fixes since Day 3.
- This is exactly the hands-on task waiting in `LAB.md` — the room repeats this fix themselves in a few minutes, this walkthrough is so they've seen the shape of it once, live, before doing it under their own steam.

**Ask the room**: "Where else in a codebase you know does user-supplied text eventually get rendered somewhere — a report, a PDF, a log viewer, a Slack message? Would the same escaping gap have been obvious to you before today?"

**Common misconception to pre-empt**: "Claude wrote it, so it already thought about security." Claude Code writes code the same way any contributor does — competently, for the prompt it was given. A prompt that asks for a notification body and doesn't mention untrusted input gets a notification body, not a security review. The review step is still yours.

**1d. Output verification — the pre-merge checklist (0:26–0:34)**

- Every day this week has built toward one habit: verify before you merge, not "it compiled and the demo looked right." Block 1's case study is a concrete instance of a broader rule — some categories of change are high-consequence enough that they should never land un-reviewed, no matter how confident the diff looks.
- Never accept unreviewed: **authentication and authorization changes** (who can do what — get this wrong and you've shipped a security hole, not a bug), **data migrations** (irreversible or expensive to reverse once run against real data), **anything touching money** (rounding, currency handling, billing logic — silent drift here is exactly the kind of bug that's invisible until finance notices), **deletes** (especially bulk or cascading ones — a delete that runs against the wrong scope doesn't have an easy "just re-run it" fix).
- A practical pre-merge pass: read the diff line by line, don't skim it. Run the actual tests, don't just trust that they were run. For anything in the four categories above, ask specifically "what happens if this is wrong" before asking "does this look right" — the second question is much easier to accidentally answer yes to.
- Tie back to the case study: an HTML-escaping fix is a good example of a change that looks small and low-risk in diff form but sits squarely in "handles untrusted input" — worth the extra scrutiny disproportionate to its line count.

**1e. Prompt engineering for Claude Code (0:34–0:40)**

- The pattern the whole programme has built toward, restated for capstone-scale work: **goal + constraints + where + how to verify**. At capstone scale this matters more, not less — a vague prompt on a 3-hour team build compounds into hours of rework, not minutes.
- Context: point Claude at the specific files and conventions that matter (`CLAUDE.md`, the relevant service, the relevant existing test) rather than assuming it'll rediscover your codebase's conventions from nothing.
- Acceptance criteria: state up front what "done" means, ideally in a form that's checkable — a specific test passing, a specific status code, a specific behavior at a named edge case. This is the same lesson as Day 2's bulk-endpoint spec, now applied to whatever your team is building this afternoon.
- Plan-mode-first for anything non-trivial: for a capstone-sized feature, ask for a plan before any file changes, read it, and only then approve. The cost of reviewing a plan is minutes; the cost of unwinding an hour of code built on a misunderstood requirement is not.

**1f. Context hygiene (0:40–0:45)**

- `/context` shows what's actually occupying the current session's budget, broken down by source — check it periodically during a long capstone session rather than waiting for a slowdown to notice.
- `/compact` frees budget by summarizing what's happened so far — it keeps the gist, not exact wording or exact numbers. Use it deliberately, at a point where you know what's safe to lose, not automatically the moment the option appears.
- Reset (`/clear`) between genuinely unrelated tasks, not mid-task. Checkpoints and `--resume`/`--continue` let you step back into an earlier point instead of re-explaining context you already established — worth knowing cold before a 3-hour session where losing track of where a long session's gone costs real build time.

**1g. Team adoption (0:45–0:48)**

- Sharing `CLAUDE.md`, skills, and plugins is how a team's Claude Code practice compounds instead of staying siloed per-developer — every convention one person teaches Claude, the whole team inherits the moment it's committed.
- Review norms for agent-authored PRs: the diff should be reviewed the same way any PR is reviewed — the fact that Claude wrote most of it doesn't earn it a lighter pass, and per 1d, some categories deserve a heavier one.
- Onboarding a new developer in a day is the practical payoff of everything documented this week: a well-written `CLAUDE.md`, a scoped `.claude/settings.json`, and a couple of good skills mean a new hire's first Claude Code session already knows the codebase's conventions instead of learning them by trial and error.

**1h. Cost governance and the Agent SDK (0:48–0:50)**

- `/cost` shows what a session has actually spent — check it, especially on a long capstone build, rather than discovering the number at the end. Model routing (Opus for planning/architecture-heavy work, Sonnet for day-to-day building, Haiku for high-volume simple tasks) is a cost lever as much as a quality one — the cheapest model that reliably does the job is the right choice, not the most capable one by default.
- For teams that outgrow the interactive CLI — running Claude Code programmatically, embedding it in a service, building custom automation around it rather than typing into a terminal — the **Claude Agent SDK** is the path beyond the CLI. Today's programme has stayed CLI-first throughout; know that the SDK exists as the next step for teams that need to run these agents as part of their own software rather than as a tool a person drives directly.

**Common misconception to pre-empt (cost)**: "The model tier only matters for quality." It's also latency and spend, at scale — a team routing every task to the top tier by default is paying for capability most of those tasks don't need, the same lesson as Day 2's model-selection block, now at team scale.

### Hands-on (0:50–1:28) — see `LAB.md` Block 1

Learners fix the notification-escaping issue with a real regression test, harden `.claude/settings.json` past its current thin baseline, and write `.claude/rules/security.md` and `.claude/rules/testing.md`. Circulate — the most common miss is fixing only the title interpolation (per 1c) and missing `description`/`user.name` in the same file, or writing a regression test that doesn't actually fail against the unfixed code (revert it and check, the way 1c demonstrated). `ASSESSMENT.md` is the graded version of this same work.

### Wrap (1:28–1:30)

Confirm everyone has run `node scripts/grade.mjs` at least once before moving on — not necessarily passing yet, but far enough to know where they stand. Point the room at `ASSESSMENT.md` and `RUBRIC.md` for the exact acceptance criteria, and tell them explicitly: whatever isn't finished by 1:30 is finishable in spare moments across the day, but Block 2 starts on time regardless.

---

## BLOCK 2 — Capstone Build (3:00)

This block has no separate teaching content — everything the room needs to build was either covered across the last six days or is written into `capstone/CAPSTONE.md`, which this file does not repeat. Trainer logistics only:

- Teams and tracks were already assigned on Day 5. Don't spend Block 2 time on team formation — if anyone arrives without a team or track, sort it in the first five minutes, not later.
- Point the room at `capstone/CAPSTONE.md` for the scenario, their track's mandatory deliverables and stretch goals, the shared constraints (skill + hook + sub-agent + headless mode + plan mode, all demonstrably used), and the submission format.
- **The halfway checkpoint is mandatory, not optional.** At roughly the 90-minute mark, walk every team in the room, not just the ones who raise a hand. Teams routinely over-scope a 3-hour capstone — ask each team directly what's actually running right now, and if nothing is, force an explicit cut on the spot. A team that's honest about a smaller working scope at the checkpoint does better on the day than one that keeps building toward an ambitious plan with 90 minutes left and nothing yet demonstrable.
- Circulate throughout, not just at the checkpoint. The teams most likely to need an unprompted nudge are the quiet ones, not the ones asking questions.

---

## BLOCK 3 — Presentations & Wrap (1:30)

Also no separate teaching content. Logistics only:

- Each team gets 10 minutes: demo plus Q&A, using the demo script template already in `capstone/CAPSTONE.md` — point teams there rather than improvising a format live.
- Keep time strictly. A team that runs long eats into every team after them; give a two-minute warning and cut cleanly at 10.
- After demos: programme summary (recap the week block by block, day by day, in a few sentences each — the room has been in the material for six days, they don't need it re-taught, just tied together), roadmap/next steps for continuing past today, feedback collection, certificates.
- This is the last thing the room does together — leave time for it to land as a close, not get rushed because Block 2 ran long. If time is short anywhere today, protect this block over compressing it.

---

## Timing summary

| Segment | Window | Cuttable? |
|---|---|---|
| Block 1 — Teach | 0:00–0:50 | trim 1g/1h first if behind, never cut 1c |
| Block 1 — Hands-on | 0:50–1:28 | see `LAB.md` |
| Block 1 — Wrap | 1:28–1:30 | no |
| Block 2 — Capstone build | 1:30–4:30 | no — checkpoint at the halfway mark is mandatory |
| Block 3 — Presentations & wrap | 4:30–6:00 | no — protect this block, compress Block 1 teaching earlier in the day instead |
