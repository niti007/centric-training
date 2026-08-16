---
description: TODO — describe what this command does in one line (see CAPSTONE.md deliverable 3: coverage, failures, gaps to a fixed-schema file)
---

<!--
Skeleton only. This is intentionally not the finished command — filling
it in is deliverable 3 of Track B. For frontmatter shape, this repo
already has a *simpler* qa-report command at
`day7/.claude/commands/qa-report.md` that reports pass/fail only
and never writes to a file; yours needs to go further: structured output,
written to a file, in a fixed schema, per CAPSTONE.md.
-->

TODO: list the steps this command runs, in order, e.g.:

1. Run `npm run test:cov` (not just `npm test` — you need coverage
   numbers for the report) and capture real output. Do not fabricate
   results.
2. Run `npm run lint` and capture real output.
3. Run `npm run build` and capture real output.
4. TODO: decide the fixed schema for the report (what fields, what
   format — JSON? Markdown table? Needs to be parseable/diffable if you
   want the "trend line across two runs" stretch goal).
5. TODO: decide where the report file is written and whether it's
   committed, gitignored, or an artifact.
6. TODO: decide what "gaps" means in this report — pointer to
   COVERAGE-GAPS.md? A live re-computation? Don't just restate lint/test
   output under a different heading.

Do not attempt to fix anything in this command — report only.
