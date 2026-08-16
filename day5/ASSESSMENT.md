# Day 5 — Graded Practical

## Task framing

Ship a working lint hook plus a headless CI review that reliably fails on a bad pull request and passes on a clean one. This is the automation loop the whole day builds toward: local enforcement (a hook Claude can't forget to run) backed by a remote enforcement (CI Claude can't be talked out of).

Concretely, you're extending exactly what `LAB.md` built:

1. `.claude/hooks/lint-on-write.mjs` — a `PostToolUse` hook that lints any `.ts`/`.tsx` file Claude writes or edits and blocks (exit `2`) on lint errors.
2. `.claude/hooks/secret-block.mjs` — a `PreToolUse` hook that blocks (exit `2`) any write containing an API-key-shaped string.
3. `.claude/hooks/notify-stop.mjs` (or your Step 3 filename) — a `Stop` hook, always exit `0`.
4. `.claude/settings.json` extended with a `hooks` block wiring all three into `PostToolUse` / `PreToolUse` / `Stop` respectively, matcher `"Write|Edit"` where applicable — without deleting the `permissions` block that was already there.
5. `.github/workflows/claude-review.yml` — triggers on `pull_request`, runs lint/build/test, then a gated job that runs Claude Code **headlessly** (`claude -p`, `--output-format json`) with `--allowedTools "Read,Grep,Glob"` against the diff, and **fails the build** when the review finds a critical/blocking issue.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `.claude/hooks/lint-on-write.mjs`, `.claude/hooks/secret-block.mjs`, and a `Stop`-wired hook file all exist and are syntactically valid Node (`node --check` on each).
- [ ] Given a file with an obvious lint error (e.g. a `debugger;` statement — `no-debugger` is error-level in this repo's ESLint config) written to a `.ts` path, the lint hook exits `2` and reports the ESLint output. Given a clean `.ts` file, it exits `0`.
- [ ] Given write content containing an API-key-shaped string (an `AKIA…` AWS key ID, an `sk-…` style token, or a PEM private key header), the secret-block hook exits `2` **before** the content would be written. Given ordinary content, it exits `0`.
- [ ] None of the three hooks crashes (uncaught exception, non-`{0,2}` exit from a bug rather than a deliberate error path) when given malformed or empty JSON on stdin — a hook that can't parse its input should degrade to exit `0`, not blow up.
- [ ] `.claude/settings.json` is valid JSON, still contains the `permissions` block that was already there before today, and its `hooks` block wires `PostToolUse` → lint hook, `PreToolUse` → secret hook, `Stop` → the stop hook, each with a `matcher` where applicable and a `command` pointing at a file that actually exists.
- [ ] `.github/workflows/claude-review.yml` exists, is well-formed YAML (no tabs, consistent indentation), and triggers on `pull_request`.
- [ ] The workflow's Claude review step is invoked headlessly (evidence of `claude -p` and `--output-format json`, or the equivalent non-interactive invocation) with tool access restricted to `Read`, `Grep`, `Glob` only — no `Write`, `Edit`, or unscoped `Bash` for that step.
- [ ] The workflow contains a step that turns a critical/blocking review finding into a non-zero exit for the job — not just a posted comment with no consequence for the build status.
- [ ] No hardcoded API key or token appears anywhere in the workflow YAML — the Anthropic API key is read from `${{ secrets.ANTHROPIC_API_KEY }}` (or an equivalently named repo secret), never a literal.
- [ ] A short note (5–10 sentences) in `NOTES.md` under an `## Assessment` heading covering: what each hook actually catches and why you chose that pattern set for the secret scanner, how you verified the CI workflow's fail path without needing a live PR (what you ran locally, what you saw), and one limitation of what you built that you'd flag to a reviewer (e.g. a secret pattern you know you're not catching, or a review-verdict format that's brittle).

## What you submit

1. `.claude/hooks/lint-on-write.mjs`, `.claude/hooks/secret-block.mjs`, your `Stop` hook file.
2. The extended `.claude/settings.json`.
3. `.github/workflows/claude-review.yml`.
4. The `## Assessment` note in `NOTES.md`.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except Presentation, which your trainer scores by hand from your `NOTES.md` note. See `RUBRIC.md` for the full weighting.

The grader is dynamic where it can be: it doesn't just check that your hook files exist, it actually invokes them with fabricated stdin matching Claude Code's real hook input contract (see `LAB.md`'s "hook JSON contract" section) and checks the exit code they produce against a crafted violation and a crafted clean input. A hook that only "looks right" but doesn't actually block the right thing will score zero on that check, same as a missing file.
