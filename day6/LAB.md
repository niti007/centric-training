# Day 6 — Lab

6 hours total, three blocks. Each block's teaching and live demo are run by your trainer (see `TEACH.md` for their script) — this document covers the hands-on exercise portion of each block, which is where most of your individual working time goes. Work in this `day6` checkout throughout.

Keep `NOTES.md` open in the repo root throughout — several steps below ask you to record things in it (create the file if it doesn't exist yet).

Before you start Block 1, confirm you've built the app once (`npm run build` — the local MCP server reads from `dist/`, not `src/`). See `SETUP.md` if you haven't done this yet.

---

## Block 1 — MCP (0:00–2:00)

Teaching + demo: 0:00–1:20 (your trainer runs this). Your exercise: **1:20–2:00 (40 minutes)**.

### (a) Configure GitHub MCP in project scope — 10 min

Register the GitHub MCP connector for this repo (project scope, so it'd be shared with the team if this were committed):

```bash
claude mcp add github --scope project
```

Follow the OAuth flow in your browser. Once connected, confirm it's registered:

```bash
claude mcp list
```

**Definition of done**: `claude mcp list` shows the GitHub connector registered at project scope. You do not need to actually call it yet — that's what the trainer's demo already showed working end-to-end.

### (b) Connect the pre-provided local stdio MCP server — 20 min

`mcp/taskflow-server.mjs` already exists in this repo, fully working — it's a pre-provided skeleton, not something you write from scratch. Your job is to **register and connect it**, which today's repo does not yet do.

1. Confirm the server is buildable and runnable on its own:

   ```bash
   npm run build
   node --check mcp/taskflow-server.mjs
   ```

2. Create `.mcp.json` at the repo root, registering the server as a local stdio process running `mcp/taskflow-server.mjs`. You're writing this file yourself — there's no template to copy in this repo (there is one in `TEACH.md`'s conceptual description of scopes, but not a literal file to reuse).

3. Confirm Claude Code picks it up: `claude mcp list` should now show your `taskflow` server alongside GitHub. Ask Claude to use it:

   ```
   Use the taskflow MCP server's list_overdue_tasks tool and tell me which tasks are overdue.
   ```

**Definition of done**: `.mcp.json` exists, is valid JSON, and registers a server pointing at `mcp/taskflow-server.mjs`; asking Claude to call `list_overdue_tasks` returns real task data (not a tool-not-found error).

**Stuck?** If the tool call fails with a module-not-found error, you skipped `npm run build` — the server imports from `dist/services/taskService.js`, which doesn't exist until you build. If `claude mcp list` doesn't show your server at all, check `.mcp.json` is valid JSON (a trailing comma will silently break it) and sits at the repo root, not inside `mcp/`.

### (c) Measure `/context` before and after enabling three servers — 10 min

With GitHub MCP and your local `taskflow` server both connected (that's two — add a third if you have one handy, e.g. re-add GitHub under a different scope temporarily, or note two is what you have and measure that honestly):

```
/context
```

Note the token count and how much of it is attributed to MCP server tool definitions specifically (not just total context).

Then disconnect both servers (`claude mcp remove <name>` for each) and check `/context` again in a fresh session.

**Record in `NOTES.md`** under `## MCP Context Cost`: the token count with servers connected vs. without, and the specific number of tokens (or rough percentage) attributable to MCP tool definitions. Write down what you'd actually do differently on a real project given that number — keep every server connected always, or enable on demand per task?

**Stuck?** If the difference looks tiny, that's a real and useful finding for a server exposing only one tool (today's local server) — say so. The lesson scales with server count and tool-list size, not with today's minimal example specifically.

---

## Block 2 — Sub-agents & Agent Teams (2:00–4:00)

Teaching + demo: 2:00–3:15 (your trainer runs this, including a live parallel-review demo on `reportBuilder.ts` and `tasks.ts`). Your exercise: **3:15–4:00 (45 minutes)**.

### Part 1 — Build three reviewer agents from scratch — 15 min

Build your own `.claude/agents/security-reviewer.md`, `.claude/agents/perf-reviewer.md`, and `.claude/agents/style-reviewer.md`. Don't copy the trainer's demo files verbatim — writing the frontmatter yourself is the point of this step.

Each agent needs:

- `name`, a `description` specific enough that Claude can tell when to delegate to it (not "reviews code" — say what kind of review, for what).
- `tools: Read, Grep, Glob` — **read-only, no `Write`, `Edit`, or `Bash`**. These agents report findings; they don't fix anything themselves.
- A body (system prompt) telling the agent what to look for and how to report it. At minimum:
  - **security-reviewer**: authentication vs. authorization gaps (does every route that touches a specific resource check the caller actually owns/is permitted to act on it, not just that they're logged in?), unescaped output, missing input validation, hardcoded secrets.
  - **perf-reviewer**: N+1 patterns (a loop calling a per-item lookup instead of batching), redundant recomputation, unbounded growth.
  - **style-reviewer**: adherence to this repo's `CLAUDE.md` conventions (validation via `util/validate.ts`, the error envelope shape, the route/service/repo layering, naming).

**Definition of done**: three agent files exist under `.claude/agents/`, each with valid frontmatter and `tools` limited to `Read, Grep, Glob`. Sanity-check with `/agents`.

### Part 2 — Run them on the repo, produce a consolidated review — 20 min

Run all three agents in parallel against `src/routes/tasks.ts` and `src/legacy/reportBuilder.ts`:

```
Run the security-reviewer, perf-reviewer, and style-reviewer agents in parallel against src/routes/tasks.ts and src/legacy/reportBuilder.ts. Give me each agent's findings, then a consolidated summary.
```

Your consolidated review **must surface two specific, real findings** — this isn't a hypothetical exercise, both are genuinely present in this repo right now:

1. A mutation route in `src/routes/tasks.ts` that checks the caller is authenticated but does not check the caller actually owns the task being modified — unlike every sibling route in the same file, which does check ownership before acting.
2. A loop in `src/legacy/reportBuilder.ts` that looks up a task's owning user on every row/iteration instead of fetching each unique user once and reusing the result.

Describe both findings in your own words, with the specific file and the specific behavior — "there's a security issue somewhere" is not a consolidated review, it's a guess.

**Save the consolidated review to `reports/review.md`** (create the `reports/` directory if it doesn't exist). This exact path is what the grader checks — see `ASSESSMENT.md`.

**Definition of done**: `reports/review.md` exists and names both findings above specifically enough that someone who hasn't read the code could locate the exact route and the exact loop from your description alone.

**Stuck?** If your agents don't surface one of the two findings, don't hand-write it into the report yourself — that defeats the exercise. Instead, sharpen the relevant agent's instructions (does the security-reviewer's prompt actually say to check ownership, not just authentication? does the perf-reviewer's prompt actually say to look for per-row lookups?) and re-run it.

### Part 3 — Planner → implementer → reviewer chain — 10 min

Pick one small, well-scoped feature you haven't built yet (something genuinely small — a new query parameter, a new lightweight GET endpoint, a small validation addition; not a rewrite). Run it through three distinct phases rather than one blended request:

1. **Planner**: ask Claude to propose a plan for the feature — what changes, where, how it'll be verified — without writing any code yet.
2. **Implementer**: once you approve the plan, have it implemented.
3. **Reviewer**: have a fresh pass (a sub-agent, or a new session with no memory of the implementation) review the diff against the original plan — did it match, did anything drift, is anything missing?

**Record in `NOTES.md`** under `## Planner-Implementer-Reviewer`: what feature you chose, and one concrete thing the reviewer phase caught (or would have caught) that wasn't obvious during implementation. If nothing was caught, say that honestly — it's still a useful data point about how well-scoped your plan was.

---

## Block 3 — Plugins & Production Patterns (4:00–6:00)

Teaching + demo: 4:00–4:55 (your trainer runs this, including packaging and installing `taskflow-kit` into a separate repo live). Your exercise: **4:55–5:30 (35 minutes)**, then wrap 5:30–6:00.

### Populate the plugin scaffold — 15 min

`plugins/taskflow-kit/` already has a `plugin.json` manifest and three empty directories (`commands/`, `skills/`, `agents/`, each with a placeholder `README.md` explaining what belongs there). Populate them for real:

1. Copy `.claude/commands/review.md` and `.claude/commands/qa-report.md` into `plugins/taskflow-kit/commands/`.
2. Copy the `api-endpoint` skill directory (`.claude/skills/api-endpoint/`, including `SKILL.md`) into `plugins/taskflow-kit/skills/`.
3. Copy the three reviewer agents you built in Block 2 (`.claude/agents/security-reviewer.md`, `perf-reviewer.md`, `style-reviewer.md`) into `plugins/taskflow-kit/agents/`.
4. Delete the placeholder `README.md` in each directory now that it has real content.
5. Bump `plugins/taskflow-kit/plugin.json`'s `version` from `0.1.0` to `1.0.0` — it's a real, populated plugin now, not a scaffold.

**Definition of done**: `plugins/taskflow-kit/commands/`, `skills/`, and `agents/` each contain real files (not just a placeholder `README.md`); `plugin.json` is valid JSON and its `version` reflects that the plugin is complete.

### Install into a clean repo and verify — 20 min

Create or use a **separate repo** with no TaskFlow content in it — a fresh empty directory with `git init`, or any other small local repo you have handy. From there, install `taskflow-kit` from its local path in this `day6` checkout.

Verify, in that other repo specifically:

- One of the installed commands (`/review` or `/qa-report`) runs there.
- Nothing about the install silently required TaskFlow-specific files that repo doesn't have — if a command or agent assumes this repo's file layout, that's a packaging bug worth noting, not something to route around.

**Record in `NOTES.md`** under `## Plugin Install Verification`: which other repo/directory you installed into, which command you ran there, and what you observed (it worked cleanly / it broke on X). A finding that the plugin doesn't fully work standalone is a legitimate, useful result — write down what broke rather than glossing over it.

**Stuck?** If the install can't find the plugin, double check you're pointing at the actual `plugins/taskflow-kit` path on disk, not a relative path that only resolves from inside `day6`.

---

## Timing summary

| Window | Activity |
|---|---|
| 0:00–1:20 | Block 1 teach + demo (trainer-led) |
| 1:20–2:00 | Block 1 exercise: (a) GitHub MCP 10 min, (b) local server + `.mcp.json` 20 min, (c) `/context` measurement 10 min |
| 2:00–3:15 | Block 2 teach + demo (trainer-led) |
| 3:15–4:00 | Block 2 exercise: agents 15 min, consolidated review 20 min, planner→implementer→reviewer 10 min |
| 4:00–4:55 | Block 3 teach + demo (trainer-led) |
| 4:55–5:30 | Block 3 exercise: populate scaffold 15 min, install + verify 20 min |
| 5:30–6:00 | Wrap (trainer-led) |

At 6:00, stop where you are. `NOTES.md`, `.claude/agents/`, `.mcp.json`, `reports/review.md`, and `plugins/taskflow-kit/` from this lab are yours to keep working from, but the graded practical in `ASSESSMENT.md` has its own specific checklist — confirm you've met it explicitly rather than assuming today's lab work automatically satisfies it.
