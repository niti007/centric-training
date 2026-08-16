# Capstone Starter — Track C (Full-Stack Agentic Workflow)

This starter saves you the blank-page setup time so three hours is enough
to build the thing, not scaffold it. Read `capstone/CAPSTONE.md` in full
before you touch any of this — the section you want is **Track C — Full-
Stack Agentic Workflow**. This README does not restate the brief; it only
tells you what's in this folder and what still isn't.

Track C is the highest-ceiling, highest-risk track — CAPSTONE.md says to
pick it only if your team was comfortable through Day 6. This starter
gives you scoped-tool skeletons, not a designed pipeline; designing the
planner → developer → QA handoff *is* the exercise.

## How to use this starter

Drop these files into your own clone of the repo at the state your team is
starting from (post Day 7, Block 1). Paths below are relative to that
repo's root — e.g. `.claude/agents/planner.md` here goes to
`.claude/agents/planner.md` in your clone.

## What this starter gives you

- `.claude/agents/planner.md`, `developer.md`, `qa.md` — three agent
  files with correct frontmatter (`name`, `description`, `tools`) already
  scoped to each role: planner is read-only, developer has read/write/bash
  for `src`/`tests`, QA has read/bash but no write. The `description` and
  system-prompt bodies are placeholders — designing what each agent
  actually does, and how it hands off to the next one, is your job.
- `.mcp.json.example` — the shape for registering a GitHub MCP server
  (deliverable 2 needs GitHub MCP connected). No real server command or
  credentials — copy it to `.mcp.json`, fill in the real values, and
  never commit real credentials into `.mcp.json` itself.
- `PIPELINE.md` — headings only, for documenting the handoff contract
  between agents (what each one receives, what it hands off, how
  rejection/failure is signaled). CAPSTONE.md's stretch goal — the QA
  agent rejecting the developer's first attempt and the loop
  self-correcting — depends on you actually designing this, not just
  naming three agents.

## What you still have to build

Everything CAPSTONE.md lists under Track C's mandatory deliverables:

1. The actual pipeline design — fill in each agent's real
   description/system prompt in `.claude/agents/*.md`, and the handoff
   contract in `PIPELINE.md`. Nothing here designs this for you.
2. GitHub MCP wired up for real (`.mcp.json`, not the `.example`) so the
   pipeline can read a real issue from your repo, commit code, and open a
   pull request.
3. Hooks for automated linting, test execution, and PR description
   generation — this repo's existing hooks
   (`day7/.claude/hooks/*.mjs`) are lint-on-write and a stop
   notifier; a PR-description-generation hook doesn't exist anywhere in
   this repo yet, you're building it from scratch.
4. The demonstrated full loop: GitHub issue → working code → PR with
   tests, no manual intervention in between.
5. Feeding the pipeline the recurring-tasks feature as its issue —
   write that issue yourself, in your own repo, before you run the loop.

## Definition of done

See CAPSTONE.md's Track C section — one command or trigger takes an issue
number and produces a PR containing the feature plus passing tests, and
you can run it live in front of the room.
