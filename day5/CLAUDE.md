# CLAUDE.md

Guidance for Claude Code when working in the TaskFlow API repo.

## Commands

```bash
npm run dev       # local dev server (ts-node)
npm run build     # tsc build to dist/
npm run start     # run built server
npm test          # jest test suite
npm run test:cov  # jest with coverage
npm run lint      # eslint .
```

No test framework beyond Jest/Supertest. No single-test CLI shortcut beyond
`npx jest <path>`.

## Architecture

- `src/index.ts` — Express app factory (`createApp()`); only calls `.listen()`
  when run directly.
- `src/routes/` — HTTP layer only. Validates input via `util/validate.ts`,
  calls into `services/`, shapes the HTTP response. Never touches `repo/`
  directly.
- `src/services/` — business logic. Never imports Express types. Pure
  functions over the in-memory repo.
- `src/repo/taskRepo.ts` — in-memory data store with seeded fixtures.
- `src/util/` — cross-cutting helpers (validation, dates, money).
- `src/legacy/reportBuilder.ts` — a known-ugly legacy module, refactor target
  for Day 2. Do not "clean it up" incidentally while working on something
  else — it has dedicated characterization tests for a reason.

## Conventions

- Every route validates input through `util/validate.ts` before touching a
  service.
- Errors always return the envelope `{ error: { code, message, details? } }`.
- Services never import Express types (`Request`, `Response`, etc).
- Routes never import from `repo/` directly — always go through a service.
- Every new source file gets a sibling test under `tests/`.
- Route handlers that read/modify a specific task must check
  `task.userId === req.userId` (ownership), matching the pattern already used
  in `GET /tasks/:id`, `DELETE /tasks/:id`, and `POST /tasks/:id/complete`.

## Do Not Touch

- `tests/reportBuilder.characterization.test.ts` snapshots — these pin the
  legacy report's current (pre-refactor) output. Do not update the snapshot
  to make a refactor "pass" unless you have verified the new output is
  byte-for-byte equivalent in meaning.
- Do not silently fix defects while doing unrelated work — flag them and fix
  with an explicit regression test in its own change.
