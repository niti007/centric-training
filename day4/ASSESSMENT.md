# Day 4 — Graded Practical

## Task framing

Ship a working `/qa-report` command plus one auto-activating `SKILL.md`. This is narrower than the full lab: `LAB.md` also has you build `/review`, slim `CLAUDE.md`, and swap with a partner, but only the two artifacts below are graded.

This builds directly on Lab Steps 2 and 3 — you are not starting from scratch if you completed the lab. If you're picking this up fresh, budget roughly 20 minutes for `/qa-report` and 20 for the skill, including the auto-activation test.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `.claude/commands/qa-report.md` exists, its YAML frontmatter parses, and it has a `description` field that is specific to what the command does (not a generic placeholder like "runs checks" or "QA command").
- [ ] The command body references real repo commands — `npm test`, `npm run lint`, and `npm run build` (or the repo's actual script names for these) — not a vague instruction to "check everything's okay." A grader can't invoke the LLM behind a command file, so specificity here is the proxy for "this would actually produce a real report if run."
- [ ] The command body specifies a fixed output schema for the report it produces (e.g., explicit sections for lint/build/test status and an overall pass/fail verdict) — not free-form prose left to the model's judgment each time.
- [ ] You have actually run `/qa-report` at least once and pasted its real output into `NOTES.md` under a `## QA Report Run` heading, so there's a concrete artifact proving it produces the shape it promises — the grader cannot invoke Claude Code itself, so this manual proof is required.
- [ ] `.claude/skills/api-endpoint/SKILL.md` exists, its YAML frontmatter parses, and includes both `name` and `description`.
- [ ] The skill's `description` is written to trigger reliably: it names the concrete situation (adding/creating/scaffolding an endpoint or route) and reads as something a real request would match against — not "helps with endpoints" or "API related tasks."
- [ ] The skill's body encodes this repo's actual convention for adding an endpoint (validate via `util/validate.ts` → delegate to a service → ownership check where applicable → error envelope `{ error: { code, message, details? } }` → sibling test → docs) — not a generic "write good code" checklist that could apply to any codebase.
- [ ] You have tested auto-activation with a prompt that never names the skill or says "skill" (e.g., "I need an endpoint that lets a user archive a task") and recorded the exact prompt plus what happened in `NOTES.md` under `## Skill Auto-Activation Test` — quote a concrete piece of evidence that the skill's convention showed up in the response, not just "it worked."
- [ ] `.claude/commands/qa-report.md`'s `allowed-tools` (if set) or the command's actual behavior doesn't require write access it doesn't need — a report-only command shouldn't hold unscoped `Bash` or `Write`.

## What you submit

1. `.claude/commands/qa-report.md` and `.claude/skills/api-endpoint/SKILL.md` on disk.
2. `NOTES.md` with the `## QA Report Run` and `## Skill Auto-Activation Test` sections described above.
3. A short note (5–10 sentences) in `NOTES.md` under an `## Assessment` heading covering: why you wrote the skill `description` the way you did, what (if anything) you had to rewrite to get auto-activation working reliably, and one thing you'd change if you were handing this skill to a teammate who'd never seen it.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except Presentation, which your trainer scores by hand from your `NOTES.md` notes. See `RUBRIC.md` for the full weighting.

The grader is deterministic and disk-only: it inspects `.claude/commands/qa-report.md`, `.claude/skills/api-endpoint/SKILL.md`, `CLAUDE.md`, and `NOTES.md` on disk. It cannot invoke Claude Code itself to actually run `/qa-report` or trigger the skill, so it checks proxies instead — real command references and an explicit output schema for the command, specific and actionable language for the skill's description, and repo-specific convention detail in the skill's body. It does not read chat transcripts, so a convincing `NOTES.md` claim with no backing file content earns nothing.
