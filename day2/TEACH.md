# Day 2 — Trainer Script

2 hours. Eight short teaching blocks (0:00–0:50), then a 20-minute live demo (0:50–1:10), then the learner lab (1:10–1:45, see `LAB.md`), then wrap-up and assessment hand-off (1:45–2:00).

Read each block's talking points aloud in your own words, don't read verbatim — keep the sequence and the room question. These blocks run shorter than Day 1's; the topics are more numerous and more hands-on, so lean on the live demo to do the heavy lifting rather than over-explaining in the teaching blocks.

---

## Block 1 (0:00–0:07) — Conversation-driven coding

**Talking points**

- The single highest-leverage skill this whole programme teaches: specificity beats politeness. Claude Code does not need "please" — it needs a goal, constraints, a location, and a way to verify.
- Anti-patterns to name explicitly: "make it better" (better how, measured how?), "fix the bug" with no repro steps, "refactor this" with no file pointer, any prompt with no acceptance criteria at all.
- The pattern that works: **goal + constraints + where + how to verify**. E.g. not "add pagination" but "add page/size query params to `GET /tasks`, following the existing validation pattern in `util/validate.ts`, and confirm with a request against `tests/tasks.routes.test.ts`'s existing setup."
- This isn't about writing longer prompts for their own sake — a precise one-sentence prompt beats a vague paragraph. The constraint and the verification step are what's non-negotiable, not word count.

**Ask the room**: "Take the vaguest bug report you've personally received this year. What's missing from it that you'd need before you could even start?"

**Common misconception to pre-empt**: "Claude Code will just figure out what I meant." It often will make a reasonable guess — and a reasonable guess on an underspecified prompt is exactly how you get a large, plausible-looking, wrong diff. Underspecification doesn't fail loudly; it fails by producing something that looks done.

---

## Block 2 (0:07–0:14) — File operations

**Talking points**

- Four primitives: Read (one file, or a range), Write (whole-file create/overwrite), Edit (a targeted find-and-replace within a file), MultiEdit (several such edits to one file in one pass). Prefer Edit/MultiEdit over Write for existing files — Write replaces the whole file and throws away anything it doesn't know to preserve.
- Claude doesn't have the repo memorized. It finds things with Grep (content search) and Glob (path/name pattern search) before it ever opens a file — the same way you'd `grep -r` or `find` if you were new to the codebase.
- Why naming matters more with an agent in the loop: a file called `utils.ts` or a function called `handle()` gives Grep/Glob nothing to anchor on. Precise, conventional names aren't just for human readers anymore — they're load-bearing for how fast and how correctly Claude locates the right code.
- This connects straight to Block 1: "fix the bug in the service layer" is a worse prompt than "fix the bug in `taskService.list`" partly because of Grep/Glob's search surface, not just human clarity.

**Ask the room**: "If you renamed every file in this repo to `file1.ts`, `file2.ts`, etc., what would break about how Claude works here — not the code, the *process*?"

**Common misconception to pre-empt**: people assume Edit is "safer" than Write because it sounds smaller. Edit fails loudly (no match found) if the target text has drifted from what Claude expects — that's a feature, not a limitation; it's the same protection you'd want from a code review that catches a stale diff.

---

## Block 3 (0:14–0:21) — Bash execution

**Talking points**
- Claude runs your actual build, test, and package-manager commands through Bash — it doesn't reason about whether tests would pass, it runs them and reads the output.
- Long-running processes (a dev server, a watch-mode build) can be backgrounded so the session isn't blocked waiting on something that never exits on its own; Claude can poll or be notified rather than hanging.
- The loop that matters: run a command, read the failure output verbatim, feed it back into the next turn. This is why "run the tests and fix what's red" is a coherent single instruction — the failure text becomes the next input, same as it would for you.
- Tie back to Day 1 Block 5: every one of these Bash calls goes through the permission system. A well-scoped `allow` list (test runners, linters) is what makes this loop fast instead of interrupting you every turn.

**Ask the room**: "What's a command in your own team's workflow that takes long enough you'd want it backgrounded rather than blocking the session?"

**Common misconception to pre-empt**: "It read the error and knows what's wrong." It read the *text* of the error — verifying the fix actually addresses the root cause, not just makes that specific message disappear, is still your job.

---

## Block 4 (0:21–0:29) — Code generation

**Talking points**
- Generating a feature from a natural-language spec works the same way a competent contractor works from a written brief: the more concretely you specify inputs, outputs, and edge cases up front, the less back-and-forth afterward.
- Why give the test first (or alongside the spec): a test is an unambiguous, executable acceptance criterion. "Should validate the input" is vague; `expect(res.status).toBe(400)` on a malformed body is not. When you supply the test, "done" has a machine-checkable definition instead of a subjective one.
- This is the pattern behind today's `POST /tasks/bulk` lab exercise: a written spec plus existing conventions to follow, not an open-ended "build a bulk endpoint."
- Generated code should still be read, not just run once and trusted — code generation speeds up getting to a first draft, it doesn't remove the need to review what you got.

**Ask the room**: "For a feature you generated recently with any AI tool, did you write the test before or after? What changed about the result?"

**Common misconception to pre-empt**: "If the tests pass, the feature is done." Passing tests only prove what the tests check. A spec with sparse test coverage will get you code that satisfies the letter of the spec while missing an edge case nobody wrote a test for.

---

## Block 5 (0:29–0:36) — Refactoring

**Talking points**
- The core rule: behavior-preserving first, everything else second. A refactor that quietly changes what the code does is a rewrite wearing a refactor's name.
- Before touching legacy code with no tests, write characterization tests: tests that pin down what the code *currently* does (bugs included), not what it *should* do. They're your regression net during the refactor, not a judgment on correctness.
- The right order: characterization test first → confirm it's green against the untouched code → make one small extraction → confirm still green → repeat. Never do the whole refactor in one uncheckable leap.
- This is exactly what the live demo is about to show, and exactly what the graded practical asks you to do for real.

**Ask the room**: "If a legacy function has zero tests and you don't fully understand what it does, what's the very first thing you'd write — not change, write?"

**Common misconception to pre-empt**: "It's legacy garbage, I'll just clean it up and see what breaks." Some of that "garbage" — an odd conditional, a weird edge case — may be there because it fixes a real bug someone hit in production. Characterization tests exist precisely so cleanup doesn't silently reintroduce that bug.

---

## Block 6 (0:36–0:41) — Documentation generation

**Talking points**
- Two levels: inline (JSDoc on functions/handlers) and structural (a README table of routes, a CHANGELOG entry). Both should be generated *from* the code, not written from memory of what the code is supposed to do — otherwise docs and code drift apart from day one.
- Good instruction: point at the file, ask for JSDoc on every exported handler, and specify the shape you want (params, return, error cases) rather than "add some comments."
- A generated README API table is a good sanity check in itself — producing it forces a pass over every route, which is a reasonable moment to notice something like a missing status code or an inconsistent error shape.
- Keep generated docs honest: if a route's behavior is genuinely surprising (e.g., partial-failure semantics on a bulk endpoint), the doc should say so, not paper over it with generic wording.

**Ask the room**: "Has stale documentation ever cost you real debugging time? What would have caught the drift earlier?"

**Common misconception to pre-empt**: "Once it's generated, it's done." Generated docs go stale exactly like hand-written ones the moment the code changes underneath them — the fix is regenerating routinely, not writing once and trusting forever.

---

## Block 7 (0:41–0:46) — Context management

**Talking points**
- Everything sitting in the model's context this session — `CLAUDE.md`, every file read, every tool result, the conversation so far — shares one finite budget. `/context` shows current usage broken down by source.
- `/compact` summarizes the conversation so far to free up budget, keeping the gist while dropping most raw tool output (full file contents you read ten turns ago, verbose command output). It's lossy by design — good for "I'm deep into a long session and don't need the play-by-play anymore," risky for "I need to point back at exact wording from three files ago."
- `/clear` wipes the conversation entirely and starts fresh — use it between unrelated tasks, not mid-task.
- Auto-compaction kicks in automatically as you approach the context limit if you haven't compacted manually — better to do it deliberately, at a point where you know what's safe to lose, than let it happen mid-task.
- Checkpoints and rewind let you step back to an earlier point in a session without losing the whole thing; `--resume` picks a past session to continue, `--continue` resumes the most recent one. All of this exists so you're not re-explaining context you already established.

**Ask the room**: "If you're 40 files deep into a debugging session and about to hit the context limit, what's the one piece of information you'd want to make sure survives a `/compact`?"

**Common misconception to pre-empt**: "More context read in is always better." Every file read costs budget for the rest of the session, whether or not it turns out relevant — indiscriminately reading "just in case" degrades every subsequent turn's quality, not just the turns that needed the extra detail. This is the same lesson as Day 1's CLAUDE.md-length warning, applied to session context instead of project memory.

---

## Block 8 (0:46–0:50) — Model selection

**Talking points**
- Three tiers, trading capability against cost and latency — talk about them by tier (Opus / Sonnet / Haiku), not by version number, since the specific model behind each tier changes over time.
- Haiku: high-volume, low-complexity tasks — simple transformations, quick lookups, anything where speed and cost matter more than deep reasoning.
- Sonnet: the default for day-to-day engineering work — most feature work, most refactoring, most debugging sits here.
- Opus: the hardest planning, architecture, and review tasks, where getting it right the first time is worth the extra cost and latency.
- `/model` switches tiers mid-session. `/cost` shows what the session has spent so far — check it, don't guess. Fast mode trades some capability for speed on tasks that don't need the top tier's full reasoning.
- Today's lab has you run the *same* task on two tiers and record time/cost/quality side by side — the point isn't "always use the biggest model," it's building the judgment to pick correctly per task.

**Ask the room**: "For today's `POST /tasks/bulk` generation task versus the reportBuilder refactor in the assessment, which of the two would you expect to benefit more from a higher tier, and why?"

**Common misconception to pre-empt**: "Bigger model, better result, always." For a well-specified, narrow task, a lower tier can match a higher one at a fraction of the cost and latency — the skill is matching tier to task difficulty, not defaulting to the most expensive option out of caution.

---

## Live Demo (0:50–1:10)

Run this from your own clean checkout of the TaskFlow API (this `day2` repo) — **not** the checkout learners will use for their own assessment. You are about to partially refactor `src/legacy/reportBuilder.ts` live; do not leave your working copy in a half-refactored state where a learner could copy it and skip their own graded work. Do this on a scratch branch or a throwaway clone, and reset it (`git checkout -- .` or equivalent, or just discard the clone) once the demo is done.

**Part 1 — the wrong way (cap this at 4 minutes, it will want to run long)**

```bash
cd day2
claude
```

Prompt, deliberately vague, no plan mode:

```
Clean up reportBuilder.ts, it's a mess.
```

Narrate while it runs:
- No characterization test was written first. No plan was reviewed. Claude is about to make a large, confident, unverified diff to a 275-line function with real (if buggy) behavior other code depends on.
- Let it produce the diff, then stop. Do not accept it. Point out concretely what's missing: no baseline to compare against, no way to know if behavior changed, no incremental checkpoints — just a single large leap of faith.
- Discard the diff (`git checkout -- src/legacy/reportBuilder.ts` or equivalent). Say out loud that you're discarding it, and why: this is the exact failure mode Block 5 warned about, staged on purpose.

**Part 2 — the right way**

- Confirm the characterization tests already exist: `tests/reportBuilder.characterization.test.ts`. Run them (`npx jest reportBuilder.characterization`) and show green — this is the safety net, already in place before any change is made.
- Enter plan mode (`Shift+Tab`). Prompt:

```
I want to extract one small piece of reportBuilder.ts's logic into its own named, tested function, without changing what buildReport returns. Look at the status-counting logic (the open/in_progress/done counters) as a candidate. Propose a plan before changing anything, and tell me how you'll verify behavior didn't change.
```

- Narrate: Claude proposes a plan that names the extraction, states it'll re-run the characterization tests afterward, and doesn't touch a file yet. Read the plan aloud, approve it.
- Show the diff once it lands: one small extracted function, `buildReport` calling it instead of inlining the loop, nothing else touched.
- Re-run the characterization tests. Show them still green, snapshots unchanged.
- **Stop there.** This is deliberately a single, small extraction to demonstrate the process — not the full refactor. Say explicitly: "This is one unit. The graded assessment asks for at least three, and you're doing the rest yourselves." Do not extract further live; leaving obvious extraction candidates for the assessment is intentional, not an oversight.

**Part 3 — `/compact` mid-session**

- In the same session (context is now warmed up from reading `reportBuilder.ts`, `dates.ts`, `money.ts`, the characterization tests, and the plan/diff turns), run:

```
/context
```

- Point out the breakdown and roughly how much of the budget the files you just read are occupying.
- Run:

```
/compact
```

- Immediately after, ask Claude a question that depends on a *specific detail* from before the compact — e.g. "What was the exact prompt I used for the extraction plan?" or "What was the previous total line count of `reportBuilder.ts` before we touched it?"
- Narrate the result honestly, whatever it is: `/compact` keeps the gist of what happened (an extraction was made, tests still pass) but is not guaranteed to retain exact wording or exact numbers from before the compact. This is the real, sometimes-uncomfortable answer to "what survives" — don't sanitize it into "everything important is always kept."

**Wrap the demo**: tell the room explicitly — "You'll do this same read-a-lot-then-compact exercise yourselves in Step 4 of the lab. Notice what you, personally, needed to re-establish afterward."

---

## Timing summary

| Block | Window | Cuttable? |
|---|---|---|
| 1. Conversation-driven coding | 0:00–0:07 | no |
| 2. File operations | 0:07–0:14 | no |
| 3. Bash execution | 0:14–0:21 | yes — trim to 5 min if behind |
| 4. Code generation | 0:21–0:29 | no |
| 5. Refactoring | 0:29–0:36 | no |
| 6. Documentation generation | 0:36–0:41 | yes — trim to 3 min if behind |
| 7. Context management | 0:41–0:46 | no |
| 8. Model selection | 0:46–0:50 | no |
| Live demo | 0:50–1:10 | no — cap Part 1 at 4 min if running long, never cut Part 3 |
| Lab | 1:10–1:45 | see LAB.md |
| Wrap / assessment hand-off | 1:45–2:00 | no |
