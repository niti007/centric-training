---
name: api-endpoint
description: Add a new REST endpoint to the TaskFlow API following repo conventions. Use when asked to add, create, or scaffold a new route/endpoint.
---

# Adding an API endpoint

Follow the existing pattern in `src/routes/tasks.ts` and
`src/routes/users.ts`.

1. **Route file**: add the handler to the relevant router in `src/routes/`
   (or create a new router + mount it in `src/index.ts` if it's a new
   resource).
2. **Validate first**: parse and validate all input via
   `src/util/validate.ts` helpers (`requireString`, `requireNumber`,
   `requireOneOf`, `requireISODate`, `optionalString`, `optionalNumber`)
   before calling any service. Catch `ValidationError` and respond
   `400` with `errorEnvelope(err.code, err.message, err.details)`.
3. **Delegate to a service**: routes never touch `src/repo/` directly —
   call into `src/services/`. If the logic doesn't exist yet, add a
   function to the relevant service file (services never import Express
   types).
4. **Ownership checks**: if the endpoint reads or mutates a specific
   task/user, check `resource.userId === req.userId` (see
   `GET /tasks/:id`, `DELETE /tasks/:id`) and respond `403` with
   `errorEnvelope('FORBIDDEN', ...)` on mismatch.
5. **Error envelope**: every error response is
   `{ error: { code, message, details? } }` — never a bare string or a
   different shape.
6. **Test**: add a sibling test under `tests/` covering the happy path,
   the primary validation failure, and (if applicable) the 404/403 cases.
7. **Docs**: add a row to the API table in `README.md` and a JSDoc comment
   above the handler describing method, auth requirement, and purpose.

Run `npm run lint && npm run build && npm test` before considering the
endpoint done.
