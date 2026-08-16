# Day 4 — Trainer Script

2 hours. Eight short teaching blocks (0:00–0:50), then a 20-minute live demo (0:50–1:10), then the learner lab (1:10–1:45, see `LAB.md`), then wrap-up and assessment hand-off (1:45–2:00).

Read each block's talking points aloud in your own words, don't read verbatim — keep the sequence and the room question. Today is the first day learners build reusable tooling instead of one-off prompts, so lean hard on the live demo: watching `/qa-report` get built from an empty file to a working command does more than any slide.

---

## Block 1 (0:00–0:06) — Slash commands: built-in vs custom

**Talking points**

- Claude Code ships with built-in slash commands: `/init`, `/review`, `/compact`, `/context`, `/model`, `/agents`, and more. These are part of the tool itself — no file backs them in your repo.
- A **custom** slash command is a Markdown file under `.claude/commands/` that you write. Typing `/qa-report` runs whatever that file says, every time, identically — it's not a fresh interpretation of a request, it's a stored prompt.
- The value proposition: any prompt you find yourself retyping — "review my diff against our conventions," "run the full QA suite and summarize it" — is a candidate for a command. You write it once; every future invocation is one keystroke and behaves the same way for everyone on the team who has the file.
- Today's whole session is about turning tribal prompting knowledge (the thing you'd explain to a new hire) into files the repo carries.

**Ask the room**: "What's a prompt you've personally retyped, near-verbatim, more than three times this week?"

**Common misconception to pre-empt**: "Custom commands are a lightweight scripting language." They're not — a command file is a prompt template, not code. Whatever it asks Claude to do still goes through the model; the file just makes the ask consistent and repeatable instead of retyped from memory each time.

---

## Block 2 (0:06–0:14) — Creating custom commands

**Talking points**

- Anatomy: `.claude/commands/<name>.md`. The filename (minus `.md`) is the command name — `review.md` becomes `/review`. YAML frontmatter up top, then the prompt body in plain Markdown below it.
- Frontmatter fields: `description` (shown in the command picker — also doubles as documentation for your teammates), `argument-hint` (shown next to the command name so users know what to pass), `allowed-tools` (scopes what the command is permitted to touch — a read-and-review command has no business holding Write or unscoped Bash).
- `$ARGUMENTS` — whatever the user typed after the command name gets substituted in. `/review src/routes/tasks.ts` makes `$ARGUMENTS` equal to `src/routes/tasks.ts` inside the body.
- `!` — a line starting with `!` runs as a bash pre-execution step *before* the rest of the prompt is sent; its output gets inlined into context. This is how `/qa-report` can open already knowing what `npm test` printed, instead of asking Claude to decide whether to run it.
- `@` — an `@path/to/file` reference pulls a file's contents directly into the prompt, the same as if you'd pasted it.
- Project scope (`.claude/commands/`, committed, shared with the team) vs personal scope (`~/.claude/commands/`, yours only, not repo-visible). Same mechanism, different reach — a command you want everyone on TaskFlow to have goes in the repo; a personal habit stays in your home directory.

**Ask the room**: "For a command like `/qa-report`, should `allowed-tools` include Write? Why or why not?"

**Common misconception to pre-empt**: "I'll just give the command full tool access so it never fails on a permission prompt." That defeats the point of `allowed-tools` — a review command that can also Write and Bash-anything is a command nobody can safely hand to a teammate or run against unfamiliar code. Scope it to what the task actually needs.

---

## Block 3 (0:14–0:21) — Skills (SKILL.md)

**Talking points**

- A skill lives at `.claude/skills/<name>/SKILL.md`. Frontmatter needs `name` and `description`; the body is Markdown instructions, same as a command — but skills are invoked differently (next block covers that).
- Skills can bundle more than one file: reference docs, scripts, examples, alongside the `SKILL.md` in the same directory. The `SKILL.md` itself should stay focused; supporting detail lives in sibling files Claude reads only when it needs them.
- Think of a skill as encoding a *procedure* specific to this repo — not "how to write good code" in the abstract, but "how *this* codebase adds an endpoint, specifically" (validate → delegate to service → check ownership → error envelope → test → docs).
- This is different from a command: a command is something a user explicitly invokes (`/qa-report`). A skill is something the *model* decides to pull in because the current request matches what it's for.

**Ask the room**: "What's a procedure in your own codebase that a new teammate always gets subtly wrong on their first attempt?"

**Common misconception to pre-empt**: "A skill is just a command with a different file location." The invocation model is the actual difference — nobody types `/api-endpoint`. Getting a skill to fire reliably is a distinct skill (pun intended) from writing a command, and it's the subject of the next block.

---

## Block 4 (0:21–0:27) — Auto-activation

**Talking points**

- The `description` field in a skill's frontmatter **is the trigger**. Claude decides whether to load a skill by matching the current request against that description — there's no explicit invocation, no keyword list you maintain separately.
- A weak description reads like documentation aimed at a human: "Helps with endpoints." That tells the matching process almost nothing concrete to match against.
- A strong description names the concrete situation and the action: "Add a new REST endpoint to the TaskFlow API following repo conventions. Use when asked to add, create, or scaffold a new route/endpoint." It gives the model verbs and nouns that will actually appear in a real request.
- Commands are explicit (the user typed `/name`); skills are model-invoked (the model decided the current ask matches). That's the practical distinction to hold onto: if you need something to run identically every time on demand, write a command. If you need Claude to *recognize* a recurring situation without being told, write a skill with a description built to match it.
- The only real test of a skill's description is trying to trigger it without naming it. If your test prompt says "use the api-endpoint skill," you've tested nothing — you've told it explicitly. A prompt like "I need a new endpoint for tagging tasks" is the real test.

**Ask the room**: "Read this description aloud: 'Assists with API-related tasks.' What real user request would you expect this to fire on — and what would you expect it to miss?"

**Common misconception to pre-empt**: "If the skill isn't firing, the model is broken." Far more often, the description is too vague or too self-referential (naming the skill instead of describing the situation it applies to). Fix the description before assuming the mechanism is at fault.

---

## Block 5 (0:27–0:33) — Organising `.claude/`

**Talking points**

- The directory groups by purpose: `commands/` (explicit, user-invoked), `skills/` (model-invoked procedures), `agents/` (specialized sub-agent configs — Day 6 goes deep here), `rules/` (scoped guidance, more granular than one big `CLAUDE.md`), and `settings.json` (permissions, hooks, other config).
- `settings.json` is the team-shared, committed config. `settings.local.json` is for personal overrides — a permission tweak just for your machine, a setting you don't want to force on teammates. `.gitignore` should exclude the `.local.json` variant; the base file is meant to be shared.
- This structure isn't cosmetic — it's what lets a teammate open your repo, see `.claude/commands/qa-report.md`, and understand exactly what `/qa-report` does without asking you, the same way they'd read a `package.json` script.

**Ask the room**: "If two settings files disagree — the committed one and your personal `.local.json` — which do you think should win, and why would you want it that way?"

**Common misconception to pre-empt**: "Everything Claude-related goes in one big file." The whole point of splitting commands/skills/rules/settings apart is that each piece loads and is discovered independently — one giant file re-creates the exact context-bloat problem `CLAUDE.md` had before you learned to keep it lean.

---

## Block 6 (0:33–0:38) — Sharing across projects & teams

**Talking points**

- A git-committed `.claude/` in the repo root travels with the code — clone the repo, get the commands and skills, no separate install step. This is the mechanism behind today's partner-swap exercise: your `.claude/` *is* the deliverable, not a personal convenience.
- `~/.claude/` (your home directory) holds commands and skills available in *every* project you open, regardless of repo. Useful for genuinely personal, cross-project habits — not useful for anything repo-specific, since a teammate cloning the repo won't have your home directory.
- Precedence: project-level `.claude/` takes priority over personal `~/.claude/` when both define something with the same name — the repo's shared definition wins over your personal one, so a team convention can't be silently overridden by an individual's local file.
- This is why today's commands and skills belong in the repo's `.claude/`, not your home directory — the whole point is that they work unmodified for the next person who clones TaskFlow.

**Ask the room**: "Is there a command or skill you'd want in every repo you touch, versus one that only makes sense for TaskFlow specifically?"

**Common misconception to pre-empt**: "I'll just build everything in `~/.claude/` so I always have it." That works for you alone and defeats the sharing story entirely — a skill your team needs has to live where the team's repo lives.

---

## Block 7 (0:38–0:45) — Progressive disclosure

**Talking points**

- `CLAUDE.md` loads into *every* session's context, whether or not the current task needs it. A skill loads only when its description matches the current request. That asymmetry is the whole argument for progressive disclosure: put the always-relevant essentials in `CLAUDE.md`, and push anything detailed-but-situational into a skill that only loads on demand.
- Concretely: `CLAUDE.md` should keep "routes validate through `util/validate.ts`, errors use the envelope shape" — a one-line convention reminder. The full seven-step walkthrough of *how* to add an endpoint, with examples, belongs in `.claude/skills/api-endpoint/SKILL.md`, where it only costs context on the turns that actually need it.
- **`.claude/rules`** is a further level of this same idea — scoped guidance for a subdirectory or topic, more granular than one repo-wide `CLAUDE.md`, and still always-loaded rather than model-invoked like a skill. Precedence matters here too: more specific rules should be understood as refining, not silently overriding, what `CLAUDE.md` already says.
- **Output styles** and **`--append-system-prompt`** are a related lever — they change *how* Claude communicates (tone, format, verbosity) without touching what it knows. Different tool, same instinct: keep the baseline lean and layer specifics on top only where they're needed.
- This block is the connective tissue for the whole day: everything you're about to build in the demo and lab is progressive disclosure in practice — a lean `CLAUDE.md`, and detail that loads only when it's relevant.

**Ask the room**: "Look at today's `CLAUDE.md`. What's one sentence in there that's actually a whole procedure compressed down — a candidate to become its own skill?"

**Common misconception to pre-empt**: "A leaner `CLAUDE.md` means less guidance overall." It means the *same* guidance, relocated to where it costs context only when relevant — not less guidance, better-targeted guidance.

---

## Block 8 (0:45–0:50) — Practical patterns

**Talking points**

- Walk through the shape of a few well-known command patterns, even though you're only building two today:
  - `/deploy` — bash pre-execution runs the build and a smoke check, body reports pass/fail before anyone ships.
  - `/review` — `allowed-tools` scoped to read-only + git, reviews the current diff against `CLAUDE.md`'s conventions, produces blocking/suggested/nit findings.
  - `/test` — runs the relevant test file for whatever's under discussion (often via `$ARGUMENTS` or a `@`-referenced file), reports pass/fail without trying to fix anything.
  - `/security-check` — narrow `allowed-tools`, scans a diff or file for a fixed checklist (auth checks, injection-shaped strings, secrets), reports findings only.
- The common shape across all of them: narrow, explicit `allowed-tools`; a bash pre-step that gathers *real* output rather than asking the model to guess; a fixed report structure so the output is consistent and skimmable every time.
- This is exactly the shape `/qa-report` is about to take in the live demo, and exactly what `/review` and `/qa-report` need to look like in your own lab work.

**Ask the room**: "Of `/deploy`, `/test`, and `/security-check`, which would you build first for your own team's repo, and why that one?"

**Common misconception to pre-empt**: "A good command tries to fix what it finds." Most of the patterns above are deliberately report-only — a command that reports plus one that fixes are two different, separately reviewable actions. Bundling "find issues" and "fix issues" into one command removes the checkpoint where a human decides whether the fix is wanted.

---

## Live Demo (0:50–1:10)

Run this from your own clean checkout of the TaskFlow API (this `day4` repo) — **not** the checkout learners will use for their own lab and assessment. You are about to build the exact `.claude/commands/qa-report.md` and `.claude/skills/api-endpoint/SKILL.md` learners are graded on building themselves; do not leave a finished copy in a place they could find and copy. Do this in a scratch clone and discard it once the demo is done, or otherwise scrub `.claude/commands/qa-report.md` and `.claude/skills/` from the checkout you hand back.

**Part 1 — build `/qa-report` from scratch (10 min)**

```bash
cd day4
mkdir -p .claude/commands
```

Start minimal — just frontmatter and a one-line body:

```markdown
---
description: Run lint, build, and tests and report status
---

Run npm test and tell me if it passed.
```

Run `/qa-report` once. Narrate: it works, but it's vague — "tell me if it passed" leaves the report format up to whatever the model feels like that turn, which is exactly the inconsistency a command is supposed to eliminate.

Now build it up to the real version, narrating each addition:

- Add the other two checks, in a fixed order: `npm run lint`, `npm run build`, `npm test`.
- Add an explicit instruction not to fabricate results — say out loud why: without this, a model under time pressure can produce a plausible-looking "PASS" without actually having run anything.
- Add a fixed report template: Lint (pass/fail, error count), Build (pass/fail), Tests (X passed, Y failed, failing test names), Overall (`GREEN` only if all three pass, else `RED` naming the blocker first).
- Point out `argument-hint` and `allowed-tools` as fields you could add here too, and why this particular command doesn't strictly need broad `allowed-tools` — it only needs to run fixed, known commands and report, not edit anything.

Run `/qa-report` again. Show the real, structured output. Point out: this is now the same report, in the same shape, every single time it's invoked — by you or by anyone else who clones this repo.

**Part 2 — build a skill that auto-fires on "add an endpoint" (10 min)**

```bash
mkdir -p .claude/skills/api-endpoint
```

Write a first-draft `SKILL.md` live with a weak description on purpose:

```markdown
---
name: api-endpoint
description: Helps with API endpoints
---

Follow the pattern in src/routes/tasks.ts.
```

Test it with a prompt that never says "skill" or "api-endpoint":

```
I need to add an endpoint for tagging tasks.
```

Narrate honestly whatever happens — a description this vague may or may not fire reliably, and that unpredictability *is* the teaching point. Now rewrite the description to be concrete and action-oriented, matching the pattern from Block 4:

```markdown
description: Add a new REST endpoint to the TaskFlow API following repo
  conventions. Use when asked to add, create, or scaffold a new route/endpoint.
```

Flesh out the body with the repo's real 7-step convention: route file → validate first via `util/validate.ts` → delegate to a service (never touch `repo/` directly) → ownership check → error envelope → sibling test → docs, then verify with lint/build/test.

Re-run the same untouched prompt — "I need to add an endpoint for tagging tasks" — in a fresh session. Show that the skill fires and the response follows the repo's real convention (validation first, service delegation, ownership check, error envelope, a test) without you having named the skill anywhere in the prompt.

**Wrap the demo**: tell the room explicitly — "You're about to build both of these yourselves, plus a `/review` command, in the next 35 minutes. The description rewrite you just watched — vague to specific — is exactly the iteration loop Step 3 of the lab asks you to run on your own skill."

---

## Timing summary

| Block | Window | Cuttable? |
|---|---|---|
| 1. Slash commands: built-in vs custom | 0:00–0:06 | yes — trim to 3 min if behind |
| 2. Creating custom commands | 0:06–0:14 | no |
| 3. Skills (SKILL.md) | 0:14–0:21 | no |
| 4. Auto-activation | 0:21–0:27 | no |
| 5. Organising `.claude/` | 0:27–0:33 | yes — trim to 3 min if behind |
| 6. Sharing across projects & teams | 0:33–0:38 | yes — trim to 3 min if behind |
| 7. Progressive disclosure | 0:38–0:45 | no |
| 8. Practical patterns | 0:45–0:50 | yes — trim to 3 min if behind |
| Live demo | 0:50–1:10 | no — Part 1 and Part 2 are both load-bearing, don't cut either |
| Lab | 1:10–1:45 | see LAB.md |
| Wrap / assessment hand-off | 1:45–2:00 | no |
