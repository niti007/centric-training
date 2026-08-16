# Day 6 — Graded Practical

## Task framing

Build a working 3-agent review team plus a functioning local MCP connection, and use that review team to produce a consolidated review that surfaces two real, currently-unaddressed issues in this repo:

1. A mutation route in `src/routes/tasks.ts` that checks the caller is authenticated but does not check the caller actually owns the task being modified — unlike its sibling routes in the same file, which do check ownership before acting.
2. A loop in `src/legacy/reportBuilder.ts` that looks up a task's owning user on every row/iteration instead of fetching each unique user once and reusing the result.

This is the same review your Block 2 lab exercise already walked you through building — the graded practical checks that the artifacts from that work exist, are correctly scoped, and actually name both findings. If you completed Block 2 and Block 1(b) of `LAB.md` in full, most of this is already done; treat this document as the explicit checklist to confirm against, not a new task.

You are also expected to have populated the plugin scaffold from Block 3, since the grader checks that too.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `.claude/agents/security-reviewer.md`, `.claude/agents/perf-reviewer.md`, and `.claude/agents/style-reviewer.md` all exist, each with valid YAML frontmatter (`name`, `description`, `tools` at minimum).
- [ ] Each of the three agent files scopes `tools` to a read-only set — `Read`, `Grep`, `Glob` only. None of them list `Write`, `Edit`, or `Bash`.
- [ ] `.mcp.json` exists at the repo root, is valid JSON, and registers at least one server under `mcpServers` (the local `mcp/taskflow-server.mjs` stdio server from Block 1(b) satisfies this).
- [ ] A consolidated review artifact exists at **`reports/review.md`** (the exact path `LAB.md` Block 2 has you save it to).
- [ ] That artifact's content clearly names **both** findings above, specifically enough that someone who hasn't read the code could locate the exact route and the exact loop from your description alone — not a generic "there may be a security issue" placeholder.
- [ ] `plugins/taskflow-kit/plugin.json` is valid JSON and its `commands`, `skills`, and `agents` paths each point at a directory that exists.
- [ ] Each of those three plugin directories (`commands/`, `skills/`, `agents/`) contains at least one real file beyond the placeholder `README.md` it started with — i.e. you actually populated the scaffold per Block 3, you didn't leave it empty.

None of this requires deleting or fixing the underlying issues in `src/routes/tasks.ts` or `src/legacy/reportBuilder.ts` themselves — this assessment is about the review team surfacing them, not about patching them. Leave both files as you found them.

## What you submit

1. `.claude/agents/security-reviewer.md`, `.claude/agents/perf-reviewer.md`, `.claude/agents/style-reviewer.md`.
2. `.mcp.json`.
3. `reports/review.md`.
4. The populated `plugins/taskflow-kit/` (with `version` bumped to `1.0.0` per Block 3, though the grader does not require the exact version string — only that the directories are populated).

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above deterministically by inspecting files on disk (agent frontmatter, `.mcp.json` structure, the review artifact's content, and the plugin manifest and directories). See `RUBRIC.md` for the full weighting and how partial credit is assigned within each criterion.
