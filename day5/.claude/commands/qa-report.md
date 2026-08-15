---
description: Run the test suite, lint, and build, then produce a QA status report
---

Run, in order, and capture real output (do not fabricate results):

1. `npm run lint`
2. `npm run build`
3. `npm test`

Then produce a short report:

- **Lint**: pass/fail, error count.
- **Build**: pass/fail.
- **Tests**: X passed, Y failed — list any failing test names and the file.
- **Overall**: `GREEN` if lint+build+tests all pass, otherwise `RED` with
  the blocking issue named first.

Do not attempt to fix anything in this command — report only.
