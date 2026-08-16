# Day 3 — Trainer Script

2 hours. Eight teaching blocks (0:00–0:50), then a 20-minute live demo (0:50–1:10), then the learner lab (1:10–1:45, see `LAB.md`), then wrap-up and assessment hand-off (1:45–2:00).

Read each block's talking points aloud in your own words, don't read verbatim — but keep the sequence and the room question. **Do not compress the live demo to make up time elsewhere.** It is the single most important 20 minutes in the whole 7-day programme — see the note at the top of that section.

---

## Block 1 (0:00–0:06) — How AI changes QA

**Talking points**

- Before agentic coding, writing tests was the bottleneck: it took real time, so teams under-tested and shipped anyway. That bottleneck is gone — Claude Code can generate a full test file in seconds.
- That changes what the scarce skill is. It is no longer "can you write a test fast enough" — it's "can you tell whether the test that just got written is actually worth anything."
- Introduce **coverage theatre**: a suite that hits every line but asserts nothing meaningful — no edge cases, no boundary values, assertions that would pass even if the implementation were subtly wrong. High coverage percentage, low actual protection.
- Today is about closing that gap: generating tests fast (the easy part now) *and* verifying they're real (the part that still needs a human).

**Ask the room**: "Show of hands — who has seen a PR with 90%+ coverage that still shipped a real bug? What did the missing test actually look like, in hindsight?"

**Common misconception to pre-empt**: "More tests are always better." A pile of low-value tests is worse than no tests in one specific way — it creates false confidence, and false confidence is more dangerous than known ignorance.

---

## Block 2 (0:06–0:12) — Unit test generation

**Talking points**

- The naive prompt — "write tests for this function" — tends to produce 2–3 happy-path tests and stop. You get better results by asking Claude to *enumerate cases first, then write*: "list the edge cases and boundary values for this function before writing any test code" — then review that list before it writes a single assertion.
- Categories worth prompting for explicitly: boundary values (first/last page, empty input, exactly-at-a-limit), error paths (invalid input, missing required fields), and state-dependent behavior (what changes based on what came before).
- This maps directly onto today's lab: the pagination bug in `services/taskService.ts` is exactly the kind of thing a boundary-value-first test suite finds and a happy-path-only suite misses completely.
- Tie back to Block 1: a generated suite that only covers the happy path *is* coverage theatre, even though it will show green.

**Ask the room**: "For a `list(page, size)` function, what's the first boundary case you'd ask Claude to test, before it writes anything?" (Steer toward: the first page, the last/partial page, and an out-of-range page.)

**Common misconception to pre-empt**: assuming the first draft of a generated suite is complete because it "looks thorough." Volume of test code is not the same as coverage of cases — always ask "what case would break this that isn't tested yet?"

---

## Block 3 (0:12–0:18) — Integration tests

**Talking points**

- Unit tests isolate a function; integration tests exercise the real path a request takes — routing, validation, service call, response shape — together. For an Express API, that means Supertest driving the actual `createApp()` instance, not a mocked router.
- Structure: happy path first (confirms the wiring works end to end), then the 4xx paths one at a time (401 unauthenticated, 400 invalid input, 403 wrong owner, 404 not found) — each one is a distinct, nameable scenario, not a single "bad request" catch-all test.
- Fixtures and isolation matter here more than in unit tests: this repo's in-memory `taskRepo` is seeded with fixed test data (`t1`…`t25`, users `u1`–`u3`) specifically so integration tests get deterministic, repeatable results — point at the existing `tests/tasks.routes.test.ts` as a model of the pattern, then have learners extend it in the lab.
- Auth in this repo is a toy bearer-token scheme (`Authorization: Bearer token-u1`) — show how a test sets that header, and how omitting it should reliably hit the 401 path.

**Ask the room**: "Which of the 4xx paths on `/tasks/:id` would a happy-path-only suite silently never exercise?"

**Common misconception to pre-empt**: writing one integration test that pokes the happy path and calling the endpoint "tested." A route with only a 200-path test is one refactor away from a silent regression on every error branch.

---

## Block 4 (0:18–0:24) — TDD with Claude Code

**Talking points**

- Red/green/refactor, but with one non-negotiable rule for agentic work: **you write (or explicitly review and approve) the red.** If Claude writes both the test and the implementation in the same turn, you have no independent check — the test was derived from the same reasoning as the code, so of course they agree.
- The workflow: describe the feature, ask Claude to write a *failing* test first and stop, run it and confirm it's actually red (not erroring for an unrelated reason — e.g. a typo, not a missing feature), then ask for the implementation, then confirm green.
- Why this is the single highest-leverage guardrail with agents specifically: agents are fast and confident. A wrong implementation gets produced just as fluently as a right one. A test written *before* the implementation exists, that you personally watched fail for the right reason, is evidence independent of the agent's own confidence.
- Today's lab TDD exercise (`PATCH /tasks/:id/complete`) is deliberately small so the discipline is the point, not the feature complexity.

**Ask the room**: "If Claude writes a test and an implementation in the same response and both come back green on the first run, what have you actually learned?" (Steer toward: less than it feels like — you haven't seen the test fail, so you don't know it was testing the right thing.)

**Common misconception to pre-empt**: treating TDD-with-an-agent as slower than "just asking for the feature." The check is what prevents a silently wrong implementation from shipping — the time it costs is the time you'd otherwise spend debugging it in production.

---

## Block 5 (0:24–0:30) — Debugging workflows

**Talking points**

- A repeatable loop, not a random walk: **reproduce** (get a failing test or a concrete repro command), **isolate** (narrow to the smallest unit that still fails), **hypothesize** (state, out loud or in the prompt, what you think is wrong and why), **verify** (check the hypothesis before writing a fix — don't fix and hope).
- Feed the loop back to Claude explicitly: paste the actual failing test output and stack trace, not a paraphrase of it — "it's broken" gives it nothing to reason from; the real assertion diff and stack trace do.
- Isolation matters especially with agents: a broad "why doesn't this work" prompt over a whole module invites a broad, unfocused answer. A specific failing test plus "why does this assertion fail" gets a specific, checkable answer.
- This block sets up the live demo directly — you're about to isolate and fix a real bug together, live, using exactly this loop.

**Ask the room**: "What's the difference between 'hypothesize' and 'fix'? Why does skipping straight to a fix cost you time on average, even though it feels faster in the moment?"

**Common misconception to pre-empt**: pasting a huge chunk of surrounding code "for context" instead of the specific failing output. More surrounding code without the actual error signal usually produces a plausible-sounding but unfounded diagnosis.

---

## Block 6 (0:30–0:36) — Code review with Claude Code

**Talking points**

- "Does this look good?" gets a shallow, agreeable answer almost every time. A structured prompt gets a structured, checkable one: ask explicitly for correctness issues, security issues, and performance issues, as separate categories, and ask it to cite the specific line or behavior for each finding.
- Encourage learners to ask Claude to argue *against* its own first answer on at least one point — "what's the strongest objection to this implementation?" — as a way to counter the model's default agreeableness.
- A structured review is falsifiable: each finding can be checked against the actual code (is that line really doing what's claimed?) in a way "looks fine to me" cannot be.
- This is a review *aid*, not a replacement for a human reviewer signing off — frame it as raising the floor of a first pass, not the ceiling of the whole review.

**Ask the room**: "If you ask 'does this look good?' and get 'looks good to me!', what have you actually verified?" (Steer toward: nothing — that's not a finding, it's a non-answer that happens to sound like one.)

**Common misconception to pre-empt**: trusting a clean structured review as proof of correctness. A structured review finds the categories of issue it was asked to look for — it doesn't guarantee it looked hard enough, or that a category wasn't asked for at all.

---

## Block 7 (0:36–0:43) — Verifying AI output

**Talking points**

- The industry data point worth naming plainly: AI-assisted code carries a meaningfully elevated risk of subtle logic errors compared to hand-written code for the same task. The reason isn't that the model is careless — it's that generated output is **plausible by construction**. It's optimized to look like correct code, which is a different property from being correct.
- Three concrete checks, and drill all three today:
  1. **Does the test actually fail without the fix?** If you didn't watch it go red first, you don't know.
  2. **Is the assertion tautological?** `expect(result).toBeDefined()` or `expect(result).not.toBeNull()` on a function that basically always returns *something* proves almost nothing. Look for assertions that pin an exact expected value.
  3. **Did it quietly delete or weaken the hard case?** Watch for a "fix" that also removed or loosened the one test that was actually catching the bug — sometimes the fastest way to a green suite is to make the hard assertion go away, and that is exactly the failure mode to catch.
- This block is the direct antidote to Block 1's coverage-theatre problem, and it's the exact discipline the live demo is about to model.

**Ask the room**: "You ask Claude to fix a bug and it comes back green on the first try, with no failing test shown along the way. What's your very next move before you trust it?" (Steer toward: revert the fix, confirm the test now fails, then reapply it.)

**Common misconception to pre-empt**: "the tests passed, so it's fixed." Passing tests only mean what they were written to check. A test that passes both with the bug present and with it fixed was never actually testing the bug.

---

## Block 8 (0:43–0:50) — Regression automation

**Talking points**

- A regression test's job is narrower and more mechanical than a general unit test: lock in one specific, previously-broken behavior so it can never silently come back. Write it to fail on the old (buggy) code and pass on the fix — and mentally (or actually) check that it would.
- Snapshot tests are a useful but sharp tool: they're cheap to write and great at flagging *that* something changed, but they say nothing about whether the change is correct. A snapshot going stale after a fix is exactly the expected outcome sometimes — the discipline is updating it deliberately, with a stated reason, never with a blind `-u` because it's in the way.
- "Lock behavior before you change it" — the same characterization-test instinct from Day 2's refactor work applies here: before touching a function you suspect is buggy, capture what it currently does, so your fix's effect is visible as a diff in behavior, not just a feeling that things are better now.
- Every regression test written today should be traceable to a specific bug: if you can't say in one sentence what would break without it, it isn't earning its keep.

**Ask the room**: "You fix a bug and add a regression test. What's the cheapest way to prove the test is actually doing its job?" (Steer toward: temporarily revert the fix and confirm the test now fails — exactly what today's graded practical checks for automatically.)

**Common misconception to pre-empt**: treating "I added a test" as equivalent to "I proved the fix works." A test that was never watched failing is a claim, not a proof.

---

## Live Demo (0:50–1:10) — Live-debugging the due-date defect

> **This is the emotional beat of the whole course. Do not skip it, do not compress it to recover time elsewhere, and rehearse it once beforehand — it runs long if you improvise.** Every block before this one has been building toward the exact moment where a confident, fluent, wrong answer shows up on your screen and you catch it instead of shipping it. If the room only remembers one thing from today, it should be this.

This repo has a due-date comparison helper (`util/dates.ts`, used to decide whether a task is overdue) with a real, seeded timezone bug. You are going to debug it live, in front of the room, using the exact loop from Block 5 and the exact checks from Block 7. **Do not pre-solve it and perform the solution — actually run the loop.** The value of this demo is that the room watches a plausible wrong answer get proposed and then gets caught, not that they watch you type a known-correct diff.

**Setup**

```bash
cd day3
claude
```

**Step 1 — state the symptom, don't diagnose it yet**

Prompt Claude with the observed behavior, not the fix:

```
Tasks near their due date sometimes show as overdue when they shouldn't be, or vice versa, depending on what timezone the server is running in. Can you find and fix the bug in how we determine whether a task is overdue?
```

Narrate while it runs: it will likely go straight to `util/dates.ts`, reason about the comparison logic, and propose a change.

**Step 2 — let the first proposed fix happen, and don't correct it yet**

This is the moment to hold your nerve. Claude's first fix will typically sound reasonable, be stated with full confidence, and address *a* plausible reading of the bug — and it will very likely still be wrong, because it normalizes the wrong side of the comparison, or normalizes both sides in a way that only happens to work for whatever example it reasoned through.

- Let it finish. Read the explanation out loud, in a neutral tone — don't tip the room off yet that anything's wrong.
- Ask the room: "Does this sound right to you?" Let a few people answer. Most will say yes, or won't be sure — that's the point.

**Step 3 — write the failing test first, exactly as Block 5 and Block 7 taught**

Narrate explicitly: "Before I accept this, I want a test that would catch it if it's wrong — across more than one timezone, since the bug is timezone-dependent and any single example might accidentally work."

Write (or have Claude draft, then you review line by line before running it) a small test that fixes a specific due date and a specific "now," and checks the overdue result — then run the *same* logical check as if the server's local timezone were different from UTC. You are testing the function's actual behavior at specific instants, not asserting on whatever `new Date()` happens to return on your machine right now.

Run it:

```
npx jest tests/dates.test.ts
```

**Step 4 — the reveal**

If the room called it "right" in Step 2, this is the payoff: the test you just wrote, run against Claude's first proposed fix, fails — or passes for the wrong reason (e.g. it only works because of the specific instant you picked, not because the logic is actually timezone-safe). Show the failure output. Do not soften this moment — let it land that a fluent, confident, plausible answer was still wrong, and the only thing that caught it was a test written *before* trusting the explanation.

**Step 5 — isolate, hypothesize, verify, then the real fix**

Now run the actual debugging loop with the room:

- **Isolate**: narrow to the exact comparison inside the overdue check — what values is it actually comparing, and in what representation (UTC epoch millis vs. a locally-constructed date)?
- **Hypothesize out loud**: state a specific, falsifiable guess about which value is silently picking up local-timezone behavior.
- **Verify**: check the hypothesis against the failing test's actual numbers before changing anything.
- **Fix**: once verified, make the smallest change that makes both sides of the comparison consistent, and rerun the test until it's green **for the right reason** — re-read the assertion and confirm it's pinned to a specific expected value, not just "doesn't throw."

**Step 6 — close the loop**

Run the full suite once more and point out that this specific test file is now green, tie it explicitly back to Block 8: "This test only proves anything because we watched it fail on the wrong fix first. If we'd accepted Step 2's answer without writing it, we'd have shipped a timezone bug with a clean-looking green checkmark next to it."

**Wrap the demo**: tell the room plainly — "Everything you do in the lab in the next 35 minutes is this same loop, just without me narrating it. The two bugs in your graded practical later are not going to announce themselves as wrong the way I just showed you — that's exactly why the check matters more than the fix."

---

## Timing summary

| Block | Window | Cuttable? |
|---|---|---|
| 1. How AI changes QA | 0:00–0:06 | trim to 4 min if behind |
| 2. Unit test generation | 0:06–0:12 | no |
| 3. Integration tests | 0:12–0:18 | no |
| 4. TDD with Claude Code | 0:18–0:24 | no |
| 5. Debugging workflows | 0:24–0:30 | no (sets up the demo) |
| 6. Code review with Claude Code | 0:30–0:36 | trim to 4 min if behind |
| 7. Verifying AI output | 0:36–0:43 | no |
| 8. Regression automation | 0:43–0:50 | no |
| Live demo — due-date defect | 0:50–1:10 | **never** |
| Lab | 1:10–1:45 | see LAB.md |
| Wrap / assessment hand-off | 1:45–2:00 | no |

If you are running behind before the demo, recover time from Blocks 1 and 6 only (4 minutes each instead of 6). Never take time from the demo, and never take time from Blocks 2, 3, 4, 5, 7, or 8 — each feeds directly into either the demo or the graded practical.
