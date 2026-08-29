# Capstone Project — Claude Code Training Programme (.NET cohort)

**Handed out**: end of Day 5 · **Built**: 10 hours (self-paced, no cloud CI/CD access) · **Presented**: next day, 20 minutes per team

Teams of 2–3. Pick **one** track.

---

## The scenario

Your team has been handed **OrchardCore** — a large, real, open-source .NET content-management
system that none of you wrote. Nobody on your team is the expert on it. You will not have time to
read the whole thing, and you don't need to.

There is no automated pipeline watching your work and no cloud build server checking it for
you — everything you build to catch mistakes has to run on your own machine, using Claude Code
itself to do the checking.

This is not a toy prompt. Treat the ten hours as a real sprint: scope deliberately, cut early,
ship something that runs, and be ready to show it working live the next day.

---

## The shared repo (all tracks)

Clone **[OrchardCore/OrchardCore](https://github.com/OrchardCore/OrchardCore)**. It's the one
codebase every track works against — only the task layered on top of it differs by track.

Why this repo: it's a real, actively-maintained ASP.NET Core application, built the way
production .NET systems are built (dependency injection, EF Core, ASP.NET Core middleware,
Razor) — so the patterns are familiar even though the codebase itself is new to you. It's also
built to be extended by outsiders, which is exactly the position your team is in.

---

## Track A — "Build a translator for the app"

*Dev-focused. Pick this if your team wants breadth across the whole delivery loop.*

Claude Code can't talk to OrchardCore directly — it doesn't know what content exists inside the
app or how to change it. Your job is to build a translator that lets Claude Code look inside the
app and make changes to it — see what content exists, create new content, search for something
specific — safely, without handing over the keys to everything.

This is harder than it sounds: you're not just wiring up a feature you designed yourselves.
You first have to figure out, from a large codebase you didn't write, what's actually worth
exposing and what would be dangerous to expose — then build and lock down the bridge itself.

### Mandatory deliverables
1. An MCP server that lets Claude Code read and change content inside OrchardCore (list content,
   create content, search by type) — built using Claude Code itself.
2. Automated tests covering everything the translator can do.
3. A sub-agent review team (security + performance + style) run against your own work, with the
   consolidated output committed as `REVIEW.md`. Security matters more here than usual — you're
   opening a new door into someone else's application.
4. A local check that runs automatically before code is saved or shared, and blocks it if
   something's broken (a Claude Code hook standing in for the CI pipeline you don't have access
   to).
5. The whole translator packaged as something a teammate could install with one command.

### Stretch
- The translator installs cleanly into a second, unrelated project and still works.
- The local check leaves a clear, readable note explaining exactly what it caught and why.

### Explicitly out of scope
Changing OrchardCore's own database layer, rewriting its authentication, building a UI for the
translator, exposing every possible action instead of a deliberately chosen set.

### Definition of done
Tests pass, the local check demonstrably blocks a broken change and lets a good one through,
`REVIEW.md` has real findings in it, and a teammate can install your translator on a clean
machine.

---

## Track B — "Prove the data is actually correct"

*QA-focused. Pick this if your team wants depth on verification.*

Right now, nobody can say for certain whether this app is saving and reading data correctly —
there's just trust, not proof. Your job is to connect the app to a real database, look inside
that database with a visual tool, and build a safety net of automated checks that would catch it
immediately if the data ever came out wrong.

This is harder than testing an app you already know: before you can write a single test, you
have to get a large, unfamiliar application talking to a database engine it doesn't normally use,
and then confirm by hand that what actually lands in the tables matches what the app claims is
there. The QA work only starts once that's solid.

### Mandatory deliverables
1. A plain write-up of where this app is most exposed to bad data — what's currently unchecked,
   ranked by how bad it would be if it went wrong — as `COVERAGE-GAPS.md`.
2. Connect OrchardCore to a **MySQL** database, then use **MySQL Workbench** to open it up and
   manually confirm, record by record, that a handful of real actions in the app produce exactly
   the data you'd expect in the tables.
3. An automated test suite — including tests that hit the real MySQL database, not a fake
   stand-in — with at least one test that would fail if the app quietly wrote to the wrong place
   or dropped a piece of data.
4. A command that produces a clear, structured report of what's covered, what's failing, and
   what's still a gap.
5. A local check that runs your test suite automatically and flags any failure the moment it
   happens.
6. A **live debugging demo**: find one real thing that's actually broken, fix it with Claude Code
   in front of the room, and prove it's fixed. Rehearse this — it's the centrepiece of your
   presentation.

### Stretch
- Show the same check run twice, once before and once after your fixes, with the improvement
  visible.
- Have Claude Code write the failing tests first, then fix the app to make them pass.

### Explicitly out of scope
Performance/load testing, testing every corner of the app instead of the highest-risk parts,
browser-based end-to-end testing.

### Definition of done
Data verified by hand in Workbench matches what the app shows, the report command runs and
produces a real report, the local check visibly fires on a failure, and the live debugging demo
runs without anything being pre-fixed off camera.

---

## Track C — "Make the app build its own feature"

*Advanced, dev + QA. Pick this only if your team was comfortable through Day 6. It is the
highest-ceiling and highest-risk track.*

Instead of a person writing a new feature for this app, your job is to build a small assembly
line of AI agents that does it instead — one agent plans the work, one writes it, one checks it —
and prove the whole line runs start to finish on a real request, with no human touching the code
in between.

This is harder than it sounds because the codebase is real and unfamiliar: each agent has to
actually understand enough of how OrchardCore is extended to work in it correctly, the handoffs
between agents have to survive a big codebase's rough edges rather than a tidy toy example, and
it isn't enough for the happy path to work once — you have to show the line catching and fixing
its own mistake.

### Mandatory deliverables
1. A pipeline of three agents — **planner, developer, and checker** — each with its own scoped
   tools and a clear handoff between them.
2. Starting from a short written request (a plain description of a small new feature, not a
   GitHub issue), the pipeline builds a real, working addition to OrchardCore — a self-contained
   extension of the kind the app is designed to be extended with.
3. Automated checks for style and correctness that run without a person triggering them by hand,
   plus a generated plain-English summary of what changed and why.
4. A demonstrated full loop — **written request → working feature → passing tests** — with zero
   manual intervention in between.
5. The checker agent must actually catch a real problem with the developer agent's first attempt
   at least once during your real run, and the pipeline must fix it on its own. This is not
   optional — showing it happen is the main proof that your pipeline works.

### Stretch
- Run the whole pipeline unattended from a single command with no interactive session open.
- Have the pipeline handle two unrelated requests back to back without any manual reset.

### Explicitly out of scope
Merging changes into the app automatically without a human looking first, coordinating across
more than one repository, training or fine-tuning a model.

### Definition of done
One command or trigger takes a written feature request and produces a working, tested addition
to the app, the self-correction moment is real and reproducible, and you can run the whole thing
live in front of the room.

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
- No secrets in `CLAUDE.md`, committed config, or logs.
- Every AI-generated change verified before it lands. You will be asked how.

Time: 10 hours to build, self-paced. Teams of 2–3.

---

## Submission

Commit your work to a local branch named `capstone/<team-name>` containing your work plus a
`SUBMISSION.md`:

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

The third section is not optional and is not a formality. A team that reports Claude got nothing
wrong has not been looking, and will be marked down on Best Practices accordingly.

---

## Rubric

| Criterion | Weight | Observable evidence |
|---|---|---|
| **Functionality** | 30% | The mandatory deliverables work. The hard edge case for your track (security scoping, real-data verification, or genuine self-correction) is actually handled. Demo runs live without repair. Partial credit for a working subset honestly scoped. |
| **Tool usage** | 25% | Skills, hooks, sub-agents, headless mode and plan mode used appropriately — not bolted on to tick the box. Tool choice fits the problem. |
| **Code quality** | 20% | Follows OrchardCore's own conventions rather than fighting them. Tests are meaningful, not tautological. Readable diffs. |
| **Presentation** | 15% | 20 minutes, well-rehearsed, shows the loop rather than describing it. Handles questions. Honest about limitations. |
| **Best practices** | 10% | Scoped permissions, no secrets, verification story is real and specific in `SUBMISSION.md`. |

Notes on marking:
- A polished demo of a small honest scope beats a broken demo of an ambitious one.
- Tests that pass whether or not the fix is present score zero on code quality for that item.
- "We used a sub-agent" with no evidence in the repo does not count as tool usage.

---

## Demo script template

Twenty minutes is more room than it sounds like, but it still goes fast if you wing it. Use this
shape:

| Time | Segment |
|---|---|
| 0:00–2:00 | **Track and scope.** What you chose, what you deliberately cut. |
| 2:00–4:00 | **The problem.** Why the workflow you built was needed. Skip the intro to OrchardCore — everyone in the room already knows it. |
| 4:00–11:00 | **Live demo.** Run the loop end to end. Do not narrate code on screen; show it working, including the moment your local check catches something. Have a recorded fallback. |
| 11:00–15:00 | **Under the hood.** The one or two Claude Code features that did the heavy lifting, and the config that made them work. |
| 15:00–17:00 | **What Claude got wrong.** Your best catch. This is the segment the room learns most from. |
| 17:00–20:00 | **Q&A.** |

Practical advice, learned the hard way:
- Run your demo end to end at least once before you present. Live agent runs are
  non-deterministic.
- Have a fallback recording or committed output for anything that calls a model live.
- Do not start your demo with an install step.

---

## Starters

`capstone/starters/option-a`, `option-b`, `option-c` contain a minimal OrchardCore checkout plus
a per-track head start (scaffolding for the MCP server project, a MySQL Workbench connection
guide, and a sample OrchardCore module skeleton, respectively) so that ten hours is enough. Use
them — teams that start from an empty directory do not finish.
