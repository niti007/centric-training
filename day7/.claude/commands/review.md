---
description: Review the current diff against main for correctness, conventions, and security
---

Review the working tree changes (`git diff main...HEAD` and any uncommitted
changes) against the conventions in `CLAUDE.md`:

1. Every route validates input through `src/util/validate.ts` before
   touching a service.
2. Errors return the envelope `{ error: { code, message, details? } }`.
3. Services never import Express types. Routes never touch `src/repo/`
   directly.
4. Every new source file has a sibling test under `tests/`.
5. Any route that reads/writes a specific task checks
   `task.userId === req.userId` unless there's a documented reason not to.

Report findings as:

- **Blocking** — must fix before merge (convention violations, missing
  auth/ownership checks, missing tests for new files, unhandled
  `ValidationError`).
- **Suggested** — worth doing, not blocking.
- **Nit** — style only.

End with a one-line verdict: `Ready to merge` or `Needs changes`.
