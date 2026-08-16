---
name: developer
description: TODO — one line describing when to invoke this agent (e.g. "Implements a plan produced by the planner agent. Use as the second stage of the planner -> developer -> QA pipeline."). Read/write/bash, intended to stay scoped to src/ and tests/.
tools: Read, Write, Edit, Bash, Grep, Glob
---

<!--
Skeleton only — frontmatter (name/tools) gives this agent read, write,
and Bash access, matching a "developer" role. Note the `tools` frontmatter
field is a tool allowlist, not a path scope — it cannot restrict Write/
Edit/Bash to only `src/` and `tests/` on its own. If you need that
restriction enforced (not just described), do it via permissions in
`.claude/settings.json` (see `day7/.claude/settings.json`'s `permissions`
block for the allow/deny/ask shape) or a PreToolUse hook that inspects
the target path, not by editing this frontmatter further.

See `day7/.claude/agents/security-reviewer.md` for the shape a
filled-in agent body takes — this one needs its own role statement and
work checklist, not that one's (this agent writes code, it doesn't
review it).
-->

You are the developer in a planner -> developer -> QA pipeline for the
TaskFlow API. You implement the plan handed to you by the planner agent.
You have read, write, and Bash access, intended to stay within `src/` and
`tests/`.

TODO: describe what input this agent receives from the planner (match
whatever `PIPELINE.md` and `planner.md` end up specifying) and what it
must produce for the QA agent — a diff? a commit? a described set of
changed files plus a summary?

TODO: describe how this agent should behave when the QA agent rejects its
first attempt (CAPSTONE.md's Track C stretch goal) — does it receive QA's
findings as input and retry, and how many times before it escalates
instead of looping forever?

TODO: describe how this agent should follow this repo's conventions from
`CLAUDE.md` (validation helper, error envelope, routes/services/repo
layering, sibling test per new source file) so its output doesn't need
manual cleanup before QA even looks at it.
