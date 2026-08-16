# Day 5 — Trainer Script

2 hours. Eight teaching blocks (0:00–0:50) — the last of which is the capstone brief handout, not a technical topic — then a 15-minute live demo (0:50–1:05), then the learner lab (1:05–1:40, see `LAB.md`), then wrap-up and assessment hand-off (1:40–2:00).

Read each block's talking points aloud in your own words, don't read verbatim — keep the sequence and the room question. Today's topics are denser than most days (hooks are a new mental model, not an extension of something learners already do by hand) — lean on the live demo to make the exit-code contract concrete rather than trying to fully land it in the teaching blocks alone.

---

## Block 1 (0:00–0:06) — Hooks overview: the full lifecycle

**Talking points**

- Everyone walks in assuming hooks are "before/after a tool call" — pre/post-tool. That's two of **nine** real lifecycle events. Naming only two undersells what hooks can do and, worse, leaves learners unable to build a `Stop` notification or a `SessionStart` context-loader without being told those exist.
- The nine events, in roughly the order they can fire in a session: `SessionStart` (a new session begins, or resumes), `UserPromptSubmit` (a prompt was submitted, before Claude sees it), `PreToolUse` (a tool is about to run), `PostToolUse` (a tool just finished), `Notification` (Claude Code has something to tell the user — e.g. waiting on a permission decision), `PreCompact` (a context compaction is about to happen, manual or auto), `Stop` (Claude is about to finish its turn), `SubagentStop` (a sub-agent — the kind spawned by the Agent tool — is about to finish its turn), `SessionEnd` (the session is ending).
- Say the count out loud: nine. It's a small enough number that the room can hold it, and naming it precisely is what stops someone building a `Stop` hook when what they actually wanted was `SubagentStop`, or vice versa.
- Frame it as a life-of-a-session timeline, not an alphabetical list — that's how learners will actually reason about which event they need.

**Ask the room**: "If you wanted to inject fresh ticket context at the very start of every session, which event would you hook — and if you wanted to know the moment a sub-agent you spawned wrapped up, which one?" (Answers: `SessionStart`; `SubagentStop`.)

**Common misconception to pre-empt**: "Hooks only fire around tool calls." Half the real value — session bookends, prompt interception, compaction awareness, sub-agent completion — has nothing to do with a tool running at all. Today's lab only wires three of the nine (`PostToolUse`, `PreToolUse`, `Stop`) because those are what the graded practical needs — say explicitly that the other six are just as real, just not this week's exercise.

---

## Block 2 (0:06–0:11) — Config shape: `settings.json`, matchers, exit codes

**Talking points**

- Hooks live under a `hooks` key in `.claude/settings.json`, alongside the `permissions` block learners already built on Day 1. Shape: `hooks.<EventName>` is an array of entries, each with an optional `matcher` and a `hooks` array of `{ "type": "command", "command": "..." }`. Put the real example from today's solution on screen:

```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      { "type": "command", "command": "node .claude/hooks/lint-on-write.mjs" }
    ]
  }
]
```

- `matcher` is a regex tested against the tool name, and it only makes sense for events that *have* a tool: `PreToolUse`, `PostToolUse`, and `PreCompact` (where it matches the compaction trigger, `"manual"` or `"auto"`, not a tool name). `Stop`, `SubagentStop`, `UserPromptSubmit`, `Notification`, `SessionStart`, and `SessionEnd` have no tool to match against — their entries just omit `matcher` entirely, as in the `Stop` block above it.
- The command receives one JSON object on **stdin** — for `PreToolUse`/`PostToolUse` that includes `tool_name` and `tool_input` (the exact shape of what the tool is about to do, or just did). It talks back through its **exit code**, plus **stderr** when it wants to explain itself.
- Now draw the exit-code table on the board — this is the single thing that trips up almost every learner the first time, so slow down here:

| Exit code | Meaning | What actually happens |
|---|---|---|
| `0` | Pass | Silent. Nothing shown to the user, nothing fed back to Claude. Tool call proceeds (or the stop/event proceeds) normally. |
| `2` | **Block** | For `PreToolUse`: the tool call is stopped *before it runs* — stderr is fed back to Claude as the reason, and Claude can react to it. For `PostToolUse`: the write/edit **already happened** — exit `2` cannot undo it. Stderr is fed back to Claude as corrective feedback (e.g. "fix these lint errors"), not a rollback. For `Stop`/`SubagentStop`: Claude is blocked from ending its turn, stderr explains why. |
| anything else non-zero (e.g. `1`) | **Hook error**, not a block | Shown to the *user* only. Does **not** stop the tool call, does **not** block the stop, does **not** feed anything back to Claude. A hook that crashes with an uncaught exception looks like it "failed loudly" but Claude Code just shows the error and moves on as if the hook had passed. |

- Say the `PostToolUse` + exit `2` distinction out loud, twice if you have to: it is feedback, not an undo button. The file is already on disk. This is the exact point `ASSESSMENT.md`'s definition of done and `scripts/grade.mjs` both test for, so it's worth the room actually getting it today rather than during their graded practical.
- And the "any other non-zero" row is the one people guess wrong: it feels like it *should* block (it's a failure, right?) and it specifically does not. A hook script with a bug in it — not a deliberate `exit(2)`, an actual crash — degrades to invisible-to-Claude, visible-to-human-only. That's why every hook in today's lab needs to handle malformed input gracefully rather than throwing.

**Ask the room**: "Your `PostToolUse` lint hook finds three ESLint errors and exits `2`. Is the bad code still on disk right now?" (Answer: yes — `PostToolUse` fires after the write already happened; exit `2` only sends feedback, it doesn't revert anything.)

**Common misconception to pre-empt**: "Exit 2 always means the action got undone." It never undoes anything for `PostToolUse` — undo-capable blocking only exists for events that fire *before* the action, i.e. `PreToolUse` (and, in its own way, `UserPromptSubmit`, which can block a prompt from ever reaching Claude).

---

## Block 3 (0:11–0:15) — Background hooks

**Talking points**

- Not every hook needs to hold up the loop. A hook command that's slow — a heavier static-analysis pass, a Slack notification round-trip — can run in a way that doesn't block Claude Code waiting on its result, as long as it isn't the thing deciding pass/fail for that event.
- The practical rule: if a hook's entire job is advisory (log it, notify someone, kick off an async job) and it has no business returning exit `2`, treat it as fire-and-forget — don't let a slow notification hook add multi-second latency to every single tool call just because it's technically wired to `PostToolUse`.
- Contrast with a blocking hook (the lint-on-write hook from today's lab): that one *has* to finish and report its exit code before the loop continues, because its exit code is the entire point.
- The design question for every hook you write: "does this decide whether something proceeds, or does it just observe?" Decisions block; observations shouldn't.

**Ask the room**: "Of the three hooks you're about to build in the lab — lint-on-write, secret-block, and a stop notification — which one has the least excuse to ever slow anything down?" (Answer: the `Stop` notification — it's pure observation, nothing left to gate.)

**Common misconception to pre-empt**: "Every hook should run in the background for speed." A `PreToolUse` safety hook (like the secret-scanner) *must* block and *must* be synchronous — its entire value is that it stands in front of the write and can stop it. Backgrounding a gate turns it into a suggestion.

---

## Block 4 (0:15–0:19) — Use cases

**Talking points**

- Four canonical patterns, and today's lab builds three of them for real:
  - **Lint/format on write** (`PostToolUse`) — catch style/quality issues the instant a file is written, not at the next `npm run lint` someone remembers to run.
  - **Test-on-write** (`PostToolUse`) — same idea, running the relevant test file instead of (or alongside) the linter. Not built today, but the same shape as lint-on-write — worth naming so learners see the pattern generalizes.
  - **Secret-scan before edit** (`PreToolUse`) — a hard rail in front of the write, not after. This has to be `PreToolUse`, not `PostToolUse`: by the time a `PostToolUse` hook sees a secret, it's already on disk (and maybe already in the working tree's staged diff).
  - **Desktop/terminal notify on `Stop`** — the simplest pattern in the set: something happened, tell a human, never block anything.
- The throughline across all four: a hook turns "please remember to do X" into "X always happens, mechanically, whether or not anyone remembers." That's the actual pitch for hooks over a CLAUDE.md instruction — CLAUDE.md is a strong suggestion the model reads; a hook is enforced by the harness regardless of what the model decides to do.

**Ask the room**: "Name one thing your own team currently relies on a person remembering to do after every commit or every AI-assisted change. Could a hook do it instead?"

**Common misconception to pre-empt**: "I could just tell Claude to always run the linter after writing a file, in CLAUDE.md." That works until a long session, a compaction, or a moment of the model just not doing it — a hook doesn't have that failure mode, because it isn't the model deciding to comply, it's the harness executing a command every single time the matcher fires.

---

## Block 5 (0:19–0:24) — Headless mode

**Talking points**

- `claude -p "<prompt>"` runs Claude Code non-interactively: no REPL, no waiting on a TTY, one prompt in, one final result out. This is the shape every CI job and every script-driven use of Claude Code needs — you cannot pipe an interactive session into a GitHub Actions job.
- `--output-format json` changes the output from prose to a JSON envelope — result text plus metadata, not just raw text on stdout. Point out explicitly: it's an envelope, not bare prose — a script has to reach into it, not just capture stdout as the answer.
- Exit codes still matter headlessly, same contract as any CLI tool: parse the JSON, decide pass/fail programmatically, and let *that* decision — not "did the process crash" — drive whether the calling script or CI job succeeds.
- Piping and non-TTY gotchas: if a command hangs in a script or CI context, the near-universal cause is a missing `-p` — without it, Claude Code is waiting on interactive input that a script will never supply. This is the single most common "why did my CI job hang for 6 hours" bug report you'll get after today.
- Today's lab (Step 4) has learners run a headless review, save the JSON, and write a tiny script that parses it and fails loudly if it isn't valid JSON — that's deliberately the exact shape the CI workflow in Step 5 depends on. Everything after this block builds on this one pattern.

**Ask the room**: "You run `claude -p \"...\"` in a script and it just hangs with no output. What's the first thing you check?" (Answer: is `-p` actually present, and is `--output-format json` there if the script expects to parse anything.)

**Common misconception to pre-empt**: "Headless mode is just the same thing as interactive mode with fewer prompts." It's a different contract entirely — no back-and-forth, no plan-mode approval step, one shot in and one structured result out. Anything that would normally need a human's "yes, go ahead" mid-session has to be resolved differently (usually via `--allowedTools`, which Block 7 covers) because there's no human there to ask.

---

## Block 6 (0:24–0:31) — CI/CD: GitHub Actions and the Azure DevOps equivalent

**Talking points**

- The shape of a GitHub Actions review workflow, `claude-review.yml`, is exactly what today's lab (Step 5) and assessment build: trigger on `pull_request`, a first job runs the normal checks (`npm run lint`, `npm run build`, `npm test`), a second job — gated behind the first passing — installs the Claude Code CLI and runs it headlessly (`claude -p`, `--output-format json`) against the diff, then a step parses that JSON and fails the job on a critical finding.
- Azure DevOps equivalent: the same shape lives in `azure-pipelines.yml` instead of a `.github/workflows/*.yml` file — a `pr:` trigger instead of `on: pull_request`, stages/jobs instead of GitHub's jobs, and the same "install CLI → run headless → parse JSON → fail the stage on a critical finding" pipeline. The concept transfers directly; only the YAML dialect and the secret-injection mechanism change.
- **Secrets handling**, either platform: the Anthropic API key is never a literal string in the workflow file. On GitHub Actions it's a repository (or environment) secret referenced as `${{ secrets.ANTHROPIC_API_KEY }}`; on Azure DevOps it's a secret pipeline variable or a variable group backed by Key Vault, referenced by name, never pasted into the YAML. Say plainly: a key committed in a workflow file is a leaked key the moment that file is pushed, full stop, license or not.
- **Cost controls** — three concrete levers, name all three: (1) scope the review to *changed files only* (diff against the PR base, not the whole repo, every run); (2) gate the expensive review job behind a label (e.g. only run when a `needs-review` label is applied, not on every single push to every PR) or behind the cheap checks passing first; (3) pick the cheapest model tier that still does a competent review — a fast, narrow diff review doesn't need the most expensive tier. This is Day 2's model-selection lesson landing again, now in a context where every run has a real dollar cost multiplied by every PR your team opens.
- Tie back to Block 5 directly: everything in this CI job is the exact headless pattern learners just built by hand in Step 4, now wrapped in YAML and triggered by GitHub instead of a terminal.

**Ask the room**: "If this workflow ran on every single push to every PR, unscoped, what would the monthly bill conversation with your engineering lead look like? What's the cheapest lever to pull first?" (Steer toward: gate by label or by the cheap checks passing first — that's the lever with the biggest effect for the least engineering effort.)

**Common misconception to pre-empt**: "CI running Claude Code is basically free because it's 'just automation.'" Every headless run is a real API call with a real cost; an ungated review job on a busy repo can run hundreds of times a day. Cost control isn't a nice-to-have here, it's the difference between a sustainable practice and a surprise invoice.

---

## Block 7 (0:31–0:35) — `--allowedTools` in automation, and automated PR review

**Talking points**

- Least privilege, stated as a hard rule for CI specifically: an automated review job should never be granted unscoped `Write` and `Bash` together. A review job's entire purpose is to *read* code and *report* — the moment it can also write files or run arbitrary shell commands against a repository triggered by an external pull request, you've built a remote code execution path that anyone who can open a PR can potentially reach.
- `--allowedTools "Read,Grep,Glob"` is the concrete mechanism: it restricts the headless run to exactly those three read-only tools, full stop. Today's workflow uses precisely this — no `Write`, no `Edit`, no unscoped `Bash`, for the review step specifically. (The earlier job in the same workflow — the one running `npm test`/`npm run lint`/`npm run build` — is ordinary CI, not Claude Code, and doesn't need this restriction; it's the Claude-invoking step that needs the tool scope.)
- Say the threat model plainly, because it's not hypothetical: a pull request from an untrusted or external contributor can contain adversarial content designed to manipulate an AI reviewer reading it — a comment or file designed to look like an instruction. Scoping tools to read-only is the mitigation that matters most here: even if the review gets confused by something in the diff, a read-only tool set means the worst case is a bad *review comment*, not a modified file or an executed command.
- **Automated PR review** as the payoff pattern: the headless run doesn't just print prose to a build log nobody reads — it posts structured findings back to the PR (as a comment, or via the JSON output driving a separate "post to PR" step) and, critically, a critical/blocking finding has to actually change the build's pass/fail status. A review comment with zero consequence for merge status is decoration, not a gate.
- This closes the loop the whole day has been building: a `PreToolUse` hook is a *local* gate a developer can't skip while working; a CI review with a real fail path is a *remote* gate nobody can skip by pushing straight to the PR. Say this pairing out loud — it's the mental model the assessment is built around.

**Ask the room**: "If your CI review step had `Bash` unscoped instead of just `Read`/`Grep`/`Glob`, what's the worst thing a maliciously crafted pull request could get it to do?" (Steer toward: run arbitrary shell commands in your CI environment, potentially exfiltrating secrets available to that job.)

**Common misconception to pre-empt**: "Restricting tools will make the review worse — it needs to run tests to give a good review, right?" A *review* step reading a diff and reasoning about it doesn't need to execute anything; the earlier job in the same workflow already ran the real tests. Conflating "review" with "verify by running code" is exactly the mistake that leads teams to over-grant a job that should be read-only.

---

## Block 8 (0:35–0:50) — Capstone brief handout

**Talking points**

- Budget the full 15 minutes here — this is a handout and team-formation block, not a technical topic, and it deserves its own unhurried pace rather than getting squeezed by whatever ran long earlier.
- Hand out (or point the room to) `capstone/CAPSTONE.md`, in the root of the training programme — it is **not** duplicated inside this `day5` repo, and you should not attempt to summarize its full content from memory; open the actual file live and walk the room through it.
- Cover, at the level `capstone/CAPSTONE.md` itself lays out: the scenario, the three tracks on offer, and the constraints common to all of them (team size, time budget, and the requirement to use at least one skill, one hook, one sub-agent, and headless mode — all things this programme has now taught, week by week, and the capstone is where they come together).
- Use today's remaining time for **team formation** — 2–3 people per team — and **track selection**. Learners don't need to have fully committed to a track by the end of today; tell them explicitly they have until next session to finalize, but forming teams now means they can coordinate on which track to skim before then.
- Close the loop for the room: today's hooks-and-CI work is not a standalone topic — it's one of the mandatory capstone ingredients. Say this plainly so it lands as "this is going in your capstone," not "this was this week's isolated exercise."

**Ask the room**: "Based on what you've built across all five days so far, which of the three tracks plays most to your team's strengths — and which plays most to a gap you'd want to close on purpose?"

**Common misconception to pre-empt**: "We should pick the track with the least work." All three tracks are scoped to the same time budget and the same mandatory-ingredient list; the real differentiator is which kind of work (feature build, QA automation, or full agentic pipeline) the team wants more practice with, not which one is "easiest."

---

## Live Demo (0:50–1:05)

Run this from your own clean checkout of the TaskFlow API (this `day5` repo) — **not** the checkout learners will use for their own lab and assessment. You are about to build real files under `.claude/hooks/` and run headless commands; `.claude/hooks/` and `.github/workflows/` are learner deliverables and must stay empty in the checkout learners start from. Do this in a scratch clone or on a throwaway branch, and discard it (`git status` to confirm what changed, then reset or just delete the clone) once the demo is done — don't hand learners a checkout where this work is already done for them.

**Part 1 — wire the `PostToolUse` lint hook (5 min)**

Narrate: this is the exact hook the lab has learners build in Step 1 — you're building it live first so the room sees the mechanism once before doing it themselves.

Create `.claude/hooks/lint-on-write.mjs` with the same shape as the reference solution: read JSON from stdin, exit `0` immediately if `tool_input.file_path` doesn't end in `.ts`/`.tsx`, otherwise run `npx eslint "<file_path>"` — on a clean pass exit `0`; on ESLint errors, write the ESLint output to **stderr** and exit `2`.

Wire it into `.claude/settings.json` under `hooks.PostToolUse`, matcher `"Write|Edit"` — show the exact block on screen (it's the same JSON shown in Block 2):

```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      { "type": "command", "command": "node .claude/hooks/lint-on-write.mjs" }
    ]
  }
]
```

Start Claude Code (`claude`) in this scratch checkout and ask it to write a small, clean `.ts` file — e.g. a one-line exported constant. Show the hook fire silently (exit `0`, nothing shown) — point out that "nothing happened" *is* the hook working correctly, not the hook being absent.

**Part 2 — break it on purpose (5 min)**

Ask Claude to write a `.ts` file containing an obvious, error-level lint violation — the same one the lab and grader both use: a stray `debugger;` statement (`no-debugger` is an error-level rule from this repo's ESLint config, not a warning).

Narrate while it runs: the write already happened — the file is on disk right now, this is `PostToolUse`, not `PreToolUse`. Then the hook fires, ESLint reports the `no-debugger` error, the hook writes that output to stderr and exits `2`. Show Claude receiving that feedback and, on its own, proposing to fix the file. Let it fix it, then write the file again and show the hook go quiet (exit `0`) on the clean version.

Say explicitly, pointing back at Block 2's table: "The bad file was on disk the entire time between the write and the fix. Exit `2` on `PostToolUse` never undid anything — it just told Claude what was wrong so it could fix it on the next turn." This is the moment to let the exit-code distinction actually land, not just be a line in a table.

**Part 3 — headless review with JSON output (5 min)**

Make one small, real, uncommitted change first — e.g. add a one-line comment to `src/util/money.ts`. Don't commit it.

Run, in a plain terminal (not inside the interactive `claude` REPL):

```bash
claude -p "Review the current uncommitted diff for correctness and convention issues. Report findings as a JSON-friendly summary." --output-format json > /tmp/review-output.json
```

Show the file's shape on screen — point out concretely that it's an envelope (result text plus metadata), not bare prose, exactly as named in Block 5. If you have a couple of minutes to spare, run `cat /tmp/review-output.json | node -e "..."` inline to pull just the review text out of it, foreshadowing the tiny parsing script the lab's Step 4 asks learners to write themselves.

**Wrap the demo**: tell the room explicitly — "Step 1 and Step 4 of the lab are exactly what you just watched, minus me narrating. Step 2's secret-blocking hook and Step 5's CI workflow are new territory for you — but they're built out of the same two pieces: a hook that reads stdin and returns an exit code, and a headless run that reads a JSON envelope back."

---

## Timing summary

| Block | Window | Cuttable? |
|---|---|---|
| 1. Hooks overview: full lifecycle | 0:00–0:06 | no |
| 2. Config shape: settings.json, matchers, exit codes | 0:06–0:11 | no — this is the block most learners get wrong later if rushed |
| 3. Background hooks | 0:11–0:15 | yes — trim to 2 min if behind |
| 4. Use cases | 0:15–0:19 | yes — trim to 2 min if behind |
| 5. Headless mode | 0:19–0:24 | no |
| 6. CI/CD: GitHub Actions + Azure DevOps | 0:24–0:31 | no |
| 7. `--allowedTools` + automated PR review | 0:31–0:35 | no |
| 8. Capstone brief handout | 0:35–0:50 | no — this is a hard deadline (materials, team formation), not a content block |
| Live demo | 0:50–1:05 | no — cap Part 1 at 4 min if running long, never cut Part 2 |
| Lab | 1:05–1:40 | see LAB.md |
| Wrap / assessment hand-off | 1:40–2:00 | no |

If you are running behind before the demo, recover time from Blocks 3 and 4 only (2 minutes each instead of 4–5). Never take time from Block 2 (the exit-code table) or Block 8 (the capstone handout) — Block 2 is what the whole day's hands-on work depends on getting right, and Block 8 has a hard external deadline (the room needs to leave with teams formed).
