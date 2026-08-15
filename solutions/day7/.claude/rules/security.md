# Security rules

- Never interpolate user-supplied strings into HTML, SQL, or shell
  commands without escaping/parameterizing.
- Every route that reads or mutates a specific resource must check
  ownership (`resource.userId === req.userId`), not just authentication.
- Never commit `.env`, credentials, or private keys. If a secret is
  accidentally staged, stop and flag it — do not commit "to fix later."
- Treat all request bodies as untrusted; validate via `src/util/validate.ts`
  before use, on every route.
