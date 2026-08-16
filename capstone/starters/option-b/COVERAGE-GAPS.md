# Coverage Gap Analysis

> Template only. Every section below needs real content — run
> `npm run test:cov`, read the report and the source, and fill this in
> with your team's actual findings. CAPSTONE.md deliverable 1 (Track B):
> "what is untested, ranked by risk, with reasoning."

## Method

<!-- TODO: how did you produce this analysis? e.g. `npm run test:cov`
     output + manual reading of src/**, which files/branches you looked
     at, anything you deliberately didn't have time to check. -->

## Coverage snapshot (before)

<!-- TODO: paste or summarize the `npm run test:cov` numbers you started
     from — statement/branch/function/line %, per file or aggregate. This
     is the "before" half of the before/after number required by the
     Definition of Done. -->

## Gaps, ranked by risk

Rank highest-risk gaps first. For each gap, state what's untested, why it
matters (blast radius if it breaks, likelihood, how central the code
path is), and what kind of test would close it.

### 1. <gap name>

- **What's untested:**
- **Why it matters (risk reasoning):**
- **Suggested test type:** unit / integration / regression
- **Priority:** High / Medium / Low

### 2. <gap name>

- **What's untested:**
- **Why it matters (risk reasoning):**
- **Suggested test type:** unit / integration / regression
- **Priority:** High / Medium / Low

### 3. <gap name>

- **What's untested:**
- **Why it matters (risk reasoning):**
- **Suggested test type:** unit / integration / regression
- **Priority:** High / Medium / Low

<!-- Add as many as your analysis surfaces. Don't pad the list with
     low-stakes gaps just to look thorough — CAPSTONE.md's rubric
     penalizes tests/analysis that don't carry real signal. -->

## Recurrence feature — anticipated gaps

<!-- TODO: the recurring-tasks feature doesn't exist yet in the codebase
     you're analyzing, but CAPSTONE.md flags month-end rollover as the
     deliberate hard edge case. Note here what you expect to need
     coverage for once the feature lands, so it doesn't get missed when
     you write the "comprehensive test suite" deliverable. -->

## Coverage snapshot (after)

<!-- TODO: fill in once your new tests land — the "after" half of the
     before/after number. -->
