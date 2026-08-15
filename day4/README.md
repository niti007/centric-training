# TaskFlow API

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run built server
- `npm test` — run test suite
- `npm run test:cov` — run test suite with coverage
- `npm run lint` — run ESLint

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Liveness check |
| GET | `/tasks` | yes | List tasks (paginated, filterable by `userId`/`status`) |
| GET | `/tasks/:id` | yes (owner) | Fetch a single task |
| GET | `/tasks/:id/summary` | yes (owner) | `{ id, title, dueIn }` |
| POST | `/tasks` | yes | Create a task |
| POST | `/tasks/bulk` | yes | Create multiple tasks in one call |
| PATCH | `/tasks/:id` | yes | Update a task |
| POST | `/tasks/:id/complete` | yes (owner) | Mark a task done |
| DELETE | `/tasks/:id` | yes (owner) | Delete a task |
| GET | `/users` | no | List users |
| GET | `/users/:id` | no | Fetch a user |
| POST | `/users` | no | Create a user |
| PATCH | `/users/:id` | no | Update a user |
| DELETE | `/users/:id` | no | Delete a user |

All error responses use the envelope `{ error: { code, message, details? } }`.
