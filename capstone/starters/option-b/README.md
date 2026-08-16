# Capstone Starter — Track B (QA Automation Suite)

This starter saves you the blank-page setup time so three hours is enough
to build the thing, not scaffold it. Read `capstone/CAPSTONE.md` in full
before you touch any of this — the section you want is **Track B — QA
Automation Suite**. This README does not restate the brief; it only tells
you what's in this folder and what still isn't.

## How to use this starter

Drop these files into your own clone of the repo at the state your team is
starting from (post Day 7, Block 1). Paths below are relative to that
repo's root, matching where each file belongs once copied in — e.g.
`.claude/commands/qa-report.md` here goes to `.claude/commands/qa-report.md`
in your clone.

## What this starter gives you

- `COVERAGE-GAPS.md` — the required headings/structure for the
  coverage-gap analysis (deliverable 1). No analysis is filled in — you
  have to actually run coverage, read the code, and reason about risk.
- `.claude/commands/qa-report.md` — a skeleton slash command: frontmatter
  and a few TODO-marked steps, not a finished command. The finished
  version is deliverable 3; this only saves you the frontmatter
  boilerplate.
- `.claude/hooks/post-commit-test.mjs` — a skeleton hook showing the
  stdin-JSON contract and exit-code convention this repo's hooks use, with
  the actual test-running/flagging logic left as a TODO (deliverable 4).

## What you still have to build

Everything CAPSTONE.md lists under Track B's mandatory deliverables,
specifically:

1. The real content of `COVERAGE-GAPS.md` — run `npm run test:cov`,
   read what it reports, and reason about what's untested and why it
   matters. This is the deliverable, not the template.
2. A comprehensive test suite — unit + integration + regression.
   CAPSTONE.md is explicit that regression tests must lock behaviour
   that *currently exists*, not just the new recurrence feature — nothing
   here scaffolds those tests.
3. Filling in `.claude/commands/qa-report.md` so it actually runs lint +
   build + test and produces a structured report to a file in a fixed
   schema, then registering it in your repo's `.claude/settings.json` if
   needed.
4. Filling in `.claude/hooks/post-commit-test.mjs` with real
   test-running logic, and wiring it into `.claude/settings.json` (see
   the `hooks` block in this repo's `day7/.claude/settings.json` for the
   registration shape — matcher + command).
5. The live debugging demo (deliverable 5) — not something you can
   scaffold in advance; pick and rehearse it.

## Definition of done

See CAPSTONE.md's Track B section — coverage measurably improved with a
before/after number, `/qa-report` runs and emits a valid report, hook
demonstrably fires, debugging demo runs live without editing anything
mid-demo.
