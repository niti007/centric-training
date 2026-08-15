# Testing rules

- Every new source file under `src/` gets a sibling test under `tests/`.
- A bug fix must ship with a regression test that fails when the fix is
  reverted — a test that passes both with and without the fix is not a
  test.
- Do not update `reportBuilder` characterization snapshots to make a
  change pass unless you have verified the new output is intentionally
  different and documented why in the commit/PR description.
- Run `npm run lint && npm run build && npm test` before calling any task
  done.
