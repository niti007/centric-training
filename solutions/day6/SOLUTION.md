# Day 6 Solution

## What changed

- `.claude/agents/security-reviewer.md`, `perf-reviewer.md`,
  `style-reviewer.md` — three read-only sub-agents (`tools: Read, Grep,
  Glob` only, no Write/Edit/Bash) each scoped to one review dimension.
- `.mcp.json` — registers a local stdio MCP server.
- `mcp/taskflow-server.mjs` — minimal MCP server skeleton exposing
  `list_overdue_tasks`, reading from the built `dist/services/taskService.js`
  (requires `npm run build` first; requires the `@modelcontextprotocol/sdk`
  package to run, per the instructor note that this block is pre-provided
  as a skeleton/fill-in-the-blank rather than from-scratch).
- `plugins/taskflow-kit/` — bundles the Day 4 commands/skill and the three
  new agents behind a `plugin.json` manifest.
- `src/routes/tasks.ts` — fixed defect #4: `PATCH /tasks/:id` now checks
  `existing.userId !== req.userId` and returns 403, matching every sibling
  route.
- `src/legacy/reportBuilder.ts` — fixed defect #5: added `fetchOwners()`,
  which pre-fetches each unique user once into a `Map`; both
  `buildPerUserSection` and `buildTaskDetailSection` now do map lookups
  instead of calling `userService.getById()` per task.
- `tests/tasks.patch.test.ts` — regression test for defect #4:
  cross-user PATCH now 403s; reverting the ownership check makes this fail.
- `tests/reportBuilder.perf.test.ts` — regression test for defect #5: spies
  on `userService.getById` and asserts the call count stays bounded by the
  user count (3) rather than the task count (25); reverting to the N+1
  version makes this fail.

## Why

Day 6 pairs the sub-agent pattern (narrow, read-only, single-concern
reviewers) with fixing the two defects those reviewers are designed to
catch — the security sub-agent surfaces defect #4, the performance
sub-agent surfaces defect #5. The MCP server and plugin scaffold are
intentionally kept as skeletons per the instructor's timing notes for the
tightest day of the programme.
