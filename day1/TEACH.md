# Day 1 — Trainer Script

2 hours. Six 10-minute teaching blocks (0:00–1:00), then a 20-minute live demo (1:00–1:20), then the learner lab (1:20–1:50, see `LAB.md`), then wrap-up and assessment hand-off (1:50–2:00).

Read each block's talking points aloud in your own words, don't read verbatim — but keep the sequence and the room question. Skip nothing in Blocks 5 and 6; permissions and CLAUDE.md are the two ideas learners misuse for the rest of the week if they leave without them.

---

## Block 1 (0:00–0:10) — What Claude Code is

**Talking points**

- Claude Code is an agentic CLI: it runs a loop of *read context, decide an action, call a tool, observe the result, decide the next action* — not a single autocomplete suggestion.
- The loop has three parts: the model, a fixed set of tools (Read, Write, Edit, Bash, Grep, Glob, and more), and a permission layer that gates every tool call.
- It does not have your codebase memorised. Every fact it uses this session — file contents, test output, directory structure — it fetched with a tool call, in front of you.
- Positioning: Copilot/Cursor-style completion predicts the next few tokens as you type, scoped to the file you have open. Claude Code is handed a goal, decides what to look at, and can touch multiple files, run your test suite, and iterate — unattended if you let it.
- That autonomy is exactly why the permission layer (Block 5) is not optional plumbing — it's the safety mechanism for an agent that can run arbitrary shell commands.

**Ask the room**: "Who here has used Copilot or Cursor's inline completion? What's the difference between that suggesting a line and what I just described?"

**Common misconception to pre-empt**: "It's just autocomplete with a chat window." Correct this immediately — the tool loop and multi-step autonomy are the entire value proposition, and treating it as fancy autocomplete leads people to under-specify tasks all day.

---

## Block 2 (0:10–0:20) — Ecosystem

**Talking points**

- Four surfaces, one model family underneath: Claude.ai (chat, for exploration and drafting), Claude Code (agentic CLI, for working inside a real repository), the Claude API (raw model access, you build the loop), the Agent SDK (a library that gives you Claude Code's agent loop to embed in your own product).
- Claude.ai: use for research, drafting prose, one-off questions with no codebase context needed.
- Claude Code: use when the task requires reading/editing real files, running commands, or iterating against test output — i.e. today, and every day after this one.
- API: use when you're building your own application feature that happens to call a model — you own the loop, the tools, the UI.
- Agent SDK: use when you want Claude Code's *agent loop itself* — planning, tool use, permissioning — inside your own product rather than the CLI.
- Model tiers (Opus / Sonnet / Haiku, not version numbers) trade off capability against cost and latency. Haiku for high-volume simple tasks, Sonnet for day-to-day engineering work, Opus for the hardest planning and review tasks. Claude Code lets you pick per-session.

**Ask the room**: "If you wanted to add an in-app 'AI helps you write your bio' feature to a product you're building, which of these four would you reach for, and why not Claude Code?"

**Common misconception to pre-empt**: people assume Claude Code and the API are competing products. They're not — Claude Code is one particular, opinionated *application* of the API's agentic capabilities, tuned for software engineering.

*If you are running behind, cut this block to five minutes — it's context-setting, not a skill they're graded on today.*

---

## Block 3 (0:20–0:30) — Install & auth

**Talking points**

- Requirements: Node 20+, npm. Install with `npm install -g @anthropic-ai/claude-code`.
- Two auth paths: subscription login (browser OAuth flow, ties to a Pro/Max/Team/Enterprise seat) or `ANTHROPIC_API_KEY` in the environment (ties to API billing). Most attendees here are on subscription login — confirm in the room.
- Config lives in two places with different scope: `~/.claude/` is user-level (your login, your personal preferences, global settings) and `<project>/.claude/` is project-level (settings and CLAUDE.md that travel with the repo and apply to everyone who clones it).
- Everyone should already have done this from `SETUP.md`. This block is a live sanity check, not a fresh install.

**Ask the room**: "Run `claude --version` right now. Who gets an error?" — resolve any stragglers using the fallback plan in `SETUP.md` while the rest of the room continues.

**Common misconception to pre-empt**: people conflate the two config directories and put project-specific settings in `~/.claude/`, where they silently don't travel with the repo and don't apply to teammates.

---

## Block 4 (0:30–0:40) — Modes

**Talking points**

- Interactive REPL: run `claude` with no arguments, get a conversational session in your terminal. Default day-to-day mode.
- Headless mode: `claude -p "<prompt>"` runs one prompt non-interactively and exits — scriptable, usable in CI, usable for the graded assessment's grader-facing command.
- Plan mode (`Shift+Tab` to cycle into it): Claude reads and researches but cannot edit files or run mutating commands until you review and approve a plan. This is the mode for any change you want to sanity-check before it touches disk.
- `--continue` resumes your most recent session; `--resume` lets you pick from past sessions. Both preserve conversation history so you don't re-explain context.
- None of these change what Claude *can* do — permissions (next block) govern that. Modes change the *workflow*: how much you see before something happens.

**Ask the room**: "For today's assessment task — writing CLAUDE.md and settings.json, then having Claude add a route — which mode would you want that route-adding step to run in, and why?"

**Common misconception to pre-empt**: people think plan mode is a "safe/preview-only" toggle that makes Claude incapable of harm. It only gates edits and mutating commands going through the normal tool loop — it is not a sandbox, and read-only actions (including arbitrary `Bash` reads, if permitted) still happen during planning.

---

## Block 5 (0:40–0:50) — Permission system

**Talking points**

- Every tool call — Read, Write, Edit, Bash, and anything MCP-provided — is checked against a permission policy before it runs: allow, deny, or ask.
- Policy is configured in `.claude/settings.json` (project) and `~/.claude/settings.json` (user), plus `--allowedTools` for one-off session overrides.
- Rules are typically scoped to a tool plus a pattern, e.g. allow `Bash(npm test:*)`, deny `Bash(rm:*)`, ask on `Bash(git push:*)`. Deny always wins over allow.
- "Accept all edits" / blanket-allow-everything feels productive in a demo and is a production incident waiting to happen the first time an agent runs something destructive, exfiltrates a secret via a crafted prompt, or pushes to a branch it shouldn't. Treat broad allow rules the same way you'd treat a broad IAM policy.
- Good default posture: allow the read-only and test/lint commands you run constantly, ask on anything with external side effects (git push, deploys, package publishes), deny anything destructive or irreversible you can enumerate (`rm -rf`, force-push, credential file reads).

**Ask the room**: "What's one command in your own team's repo that you would put on the deny list before ever letting an agent run unattended?"

**Common misconception to pre-empt**: "I'll just review every diff before it lands, so permissions don't matter." Diff review catches bad *edits*; it does nothing for a `Bash` call that already ran (deleted a branch, hit a production API, leaked a token to a third-party CLI) before you saw any diff. Permissions are the control for actions, not just for file contents.

---

## Block 6 (0:50–1:00) — CLAUDE.md

**Talking points**

- CLAUDE.md is project memory loaded into context automatically at session start — it is how you stop repeating "remember we use X" in every prompt.
- Hierarchy, broadest to narrowest, all loaded together: enterprise-managed policy → user-level `~/.claude/CLAUDE.md` → project-root `CLAUDE.md` → subdirectory `CLAUDE.md` files for area-specific detail. More specific files add to, not replace, broader ones.
- `@imports` let a CLAUDE.md pull in another file's contents (e.g. this programme's own `day1/AGENTS.md`-equivalent pattern) so you can keep one canonical source instead of copy-pasting.
- Belongs in CLAUDE.md: commands to run, architectural facts that won't be obvious from reading one file, naming/error/validation conventions, explicit "do not touch" boundaries. Doesn't belong: prose explanations of what the code does (Claude can read the code), anything that goes stale fast (a sprint's current TODO list), or restating what's already enforced by lint/type config.
- Context window basics: everything loaded — CLAUDE.md, files read, tool output — shares one finite context budget. Run `/context` to see current usage. A 5,000-line CLAUDE.md is self-harm: it burns budget on every single turn, all session, whether or not any given instruction is relevant to the current task, crowding out the actual code Claude needs to read.
- Good CLAUDE.md is short, specific, and skimmable — closer to a terse onboarding doc for a competent new hire than to a design document.

**Ask the room**: "Look at the CLAUDE.md hierarchy — enterprise, user, project, subdirectory. If your personal `~/.claude/CLAUDE.md` said 'always write commit messages in French' and the project's said 'commit messages in English, imperative mood', what happens, and where would you actually want that rule enforced instead?"

**Common misconception to pre-empt**: "More context is always better, so I should document everything." Push back with the context-budget point above — an over-long CLAUDE.md degrades every single turn's quality, not just the turns that needed the extra detail.

*If you are running behind, cut the `/imports` sub-point and the enterprise-tier detail — the project vs. subdirectory distinction and the length warning are the parts learners need for today's lab and assessment.*

---

## Live Demo (1:00–1:20)

Run this from a clean checkout of the TaskFlow API (this `day1` repo). Narrate every step — this is the model for what learners do alone in the lab.

**Setup**

```bash
cd day1
claude
```

**Step 1 — orientation question**

Type into the Claude Code session:

```
Explain what this API does and where task validation lives.
```

Narrate while it runs:
- Point out it is issuing `Glob`/`Grep` calls to find route files before opening anything, then `Read` calls on the specific files it found — it is not guessing from training data about *this* repository.
- When it answers, confirm out loud that it correctly locates `src/util/validate.ts` and the `requireString`/`requireNumber`/`requireISODate` helpers used from `src/routes/tasks.ts`.

**Step 2 — check context usage**

```
/context
```

- Point out the breakdown: system prompt, loaded CLAUDE.md (none yet — the repo has no CLAUDE.md at this point), conversation so far, tool output consumed by the orientation question.
- Connects straight back to Block 6's warning: every file it opened just now is still sitting in that budget.

**Step 3 — first edit, in plan mode**

> **Note for the trainer**: `GET /health` already exists in `src/index.ts`. Say so out loud and add a different small route instead — for example `GET /tasks/:id/exists` returning `{ exists: boolean }`. Pick whichever you like as long as it's small and clearly distinct from the Day 1 assessment's own `GET /tasks/:id/summary` task, so you aren't pre-solving the lab for anyone glancing at your screen.

- Press `Shift+Tab` to enter plan mode.
- Prompt:

```
Add a GET /tasks/:id/exists route that returns { exists: boolean }. Follow the existing conventions in src/routes/tasks.ts.
```

- Narrate: Claude is reading `tasks.ts` and `validate.ts` again to match existing patterns, then proposes a plan without touching any file yet — this is plan mode doing its job.
- Read the proposed plan aloud, approve it.
- Show the diff it produces. Point out whether it used the existing `errorEnvelope`/validation helpers correctly — if it didn't, that's a live, honest teaching moment about verifying output, not a scripted one.

**Step 4 — permission prompt on Bash**

- Once the edit lands, prompt:

```
Run the test suite to confirm nothing broke.
```

- If `Bash(npm test:*)` isn't already allowed, Claude Code will stop and show a permission prompt here. Narrate what the prompt is showing (tool, exact command, allow-once/allow-always/deny) and tie it directly back to Block 5.
- Approve it, let the room see the 3 pre-existing intentional failures plus everything else passing.

**Wrap the demo**: explicitly tell the room "the 3 failures you just saw are the same ones you'll see in your own `npm test` in the lab — that's expected, not something I broke."

---

## Timing summary

| Block | Window | Cuttable? |
|---|---|---|
| 1. What Claude Code is | 0:00–0:10 | no |
| 2. Ecosystem | 0:10–0:20 | yes — trim to 5 min if behind |
| 3. Install & auth | 0:20–0:30 | no (but should be quick if SETUP.md was done) |
| 4. Modes | 0:30–0:40 | no |
| 5. Permission system | 0:40–0:50 | no |
| 6. CLAUDE.md | 0:50–1:00 | trim the imports/enterprise sub-points only |
| Live demo | 1:00–1:20 | no |
| Lab | 1:20–1:50 | see LAB.md |
| Wrap / assessment hand-off | 1:50–2:00 | no |
