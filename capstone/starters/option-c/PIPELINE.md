# Pipeline — planner -> developer -> QA handoff contract

Headings only. This is the design document CAPSTONE.md's Track C is
actually testing — fill in every section with your team's real design
before you start running the pipeline, not after.

## Overview

<!-- TODO: one paragraph — what triggers the pipeline (an issue number?
     a slash command? a CI event?), and what it produces at the end. -->

## Stage 1: planner

**Receives:**
<!-- TODO -->

**Hands off:**
<!-- TODO — the exact shape: a file? a structured block in the
     conversation? something written to disk that the developer agent
     reads? -->

**Tools available:** Read, Grep, Glob (read-only — see
`.claude/agents/planner.md`)

## Stage 2: developer

**Receives:**
<!-- TODO -->

**Hands off:**
<!-- TODO -->

**Tools available:** Read, Write, Edit, Bash, Grep, Glob (see
`.claude/agents/developer.md` — note the frontmatter `tools` list is not
a path restriction; document here how/whether you're actually enforcing
"scoped to src/ and tests/" and where that enforcement lives, e.g.
`.claude/settings.json` permissions or a hook.)

## Stage 3: QA

**Receives:**
<!-- TODO -->

**On accept:**
<!-- TODO — does QA open the PR itself, or hand back to an orchestrator
     that does? -->

**On reject:**
<!-- TODO — required for the stretch goal (self-correcting loop). What
     does QA hand back to the developer agent, and in what format? How
     many retries before the pipeline gives up and surfaces the failure
     to a human instead of looping forever? -->

**Tools available:** Read, Bash, Grep, Glob — no Write/Edit (see
`.claude/agents/qa.md`)

## Failure / rejection signaling

<!-- TODO: the mechanism, end to end. If this is prose-only between
     agents, say so and explain why that's reliable enough; if it's a
     structured exit code / JSON block / file, define its exact shape
     here so all three agent prompts can agree on it. -->

## GitHub MCP usage

<!-- TODO: which MCP tools does which stage call (read issue, create
     branch, commit, open PR)? See `.mcp.json.example` for the server
     registration shape you still need to fill in with a real server
     and real credentials (kept out of committed config, per CAPSTONE.md's
     "no secrets in committed config" constraint). -->

## Verification story

<!-- TODO: CAPSTONE.md requires "every AI-generated change verified
     before it lands" across all tracks, and you'll be asked how. For
     Track C specifically: what verifies the developer agent's output
     before a PR opens — the QA agent's test run, a human review of the
     PR, both? Be specific; "we trusted the pipeline" is not a
     verification story. -->
