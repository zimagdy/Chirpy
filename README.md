# Chirpy

Chirpy is a simple Twitter-style microblogging API. Users can sign up, log in, post and delete short text posts called "chirps", upgrade to "Chirpy Red" (enabling longer chirps), and manage JWT-based sessions with refresh tokens. A minimal static web UI is served under `/app`.

Built with Express 5, TypeScript, Drizzle ORM, and PostgreSQL.

This project is built as part of the [Learn HTTP Servers with TypeScript](https://www.boot.dev/courses/learn-http-servers-typescript) course on Boot.dev.

## Features

- User registration and login with argon2-hashed passwords
- JWT access tokens + refresh tokens (with revocation support)
- CRUD chirps: list (newest/oldest first, filterable by author), create, delete (author-only)
- Chirp body validation: required, max 140 chars — unlimited for Chirpy Red users
- Chirpy Red upgrade via Polka payment webhooks
- Admin endpoints: visit metrics page and dev-only database reset
- Structured request logging, centralized error handling, Zod-validated env config

## Tech Stack

- **Runtime:** Node.js 24 (see `.nvmrc`)
- **Language:** TypeScript (ESM, compiled with `tsc`)
- **Web:** Express 5
- **Database:** PostgreSQL via Drizzle ORM + `postgres` driver
- **Auth:** JWT (`jsonwebtoken`), argon2 password hashing
- **Validation:** Zod
- **Testing:** Vitest
- **Payments:** Polka webhooks (Chirpy Red)

## Project Structure

```
src/
  index.ts                 # Entry point: runs migrations, mounts routes
  config.ts                # Env loading + Zod validation
  types.ts                 # Express request augmentation
  db/
    schema.ts              # Drizzle tables: users, chirps, refresh_tokens
    connection.ts          # DB client
    queries/               # users, chirps, refreshToken query helpers
    migrations/            # Generated SQL migrations
  routes/                  # chirps, users, admin routers
  middleware/              # auth, chirp validation, error handler, logging
  utils/                   # JWT/refresh-token helpers, password hashing
  app/                     # Static frontend served at /app
```

## Getting Started

### Prerequisites

- Node.js (version in `.nvmrc`)
- A running PostgreSQL instance

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
DB_URL="postgres://user:password@host:5432/chirpy?sslmode=disable"
PORT=8080
PLATFORM="dev"
SECRET_KEY="<random secret for signing JWTs>"
POLKA_KEY="<Polka API key>"
```

| Variable      | Description                                        |
| ------------- | -------------------------------------------------- |
| `DB_URL`      | PostgreSQL connection string                       |
| `PORT`        | Server port (defaults to 8080 if unset/invalid)    |
| `PLATFORM`    | Set to `dev` to enable `/admin/reset`              |
| `SECRET_KEY`  | Secret used to sign and verify JWTs                |
| `POLKA_KEY`   | Polka API key used for Chirpy Red upgrades         |

### Migrate & run

Migrations run automatically on startup. To generate/migrate manually:

```bash
npm run db:migrate   # drizzle-kit generate + migrate
```

```bash
npm run dev          # compile TypeScript and start the server
# or
npm run build && npm start
```

The server listens on `http://localhost:8080`. Health check: `GET /api/healthz`.

### Test

```bash
npm test
```

## API Reference

### Users & Auth

| Method | Endpoint             | Description                                        | Auth     |
| ------ | -------------------- | -------------------------------------------------- | -------- |
| POST   | `/api/users`         | Register a new user (email + password)             | —        |
| POST   | `/api/login`         | Log in; returns JWT access + refresh tokens        | —        |
| POST   | `/api/refresh/`      | Exchange a refresh token for a new JWT             | refresh  |
| POST   | `/api/revoke/`       | Revoke a refresh token                             | refresh  |
| PUT    | `/api/users/{id}`    | Update email/password; `is_chirpy_red: true` upgrades | JWT  |
| POST   | `/api/polka/webhooks`| Polka webhook for Chirpy Red payments              | Polka    |

### Chirps

| Method | Endpoint                        | Description                              | Auth     |
| ------ | ------------------------------- | ---------------------------------------- | -------- |
| GET    | `/api/chirps`                   | List chirps; `?sort=asc\|desc&author_id=` | JWT      |
| POST   | `/api/chirps`                   | Create a chirp (body ≤ 140 chars, or unlimited for Chirpy Red) | JWT |
| DELETE | `/api/chirps/{chirpID}`         | Delete a chirp (author only)             | JWT      |

### Admin & Static

| Method | Endpoint         | Description                                       |
| ------ | ---------------- | ------------------------------------------------- |
| GET    | `/admin/metrics` | HTML page showing static file hit count           |
| POST   | `/admin/reset`   | Wipe all users (only when `PLATFORM=dev`)         |
| GET    | `/app`           | Static frontend (`src/app/index.html`)            |

## Notes

- Chirp creation requires a non-empty body of at most 140 characters unless the user has `isChirpyRed` set.
- Refresh tokens are stored in the database with expiry and revocation timestamps; JWTs expire per `makeJWT`'s `expiresIn` argument.
- The database schema is defined in `src/db/schema.ts`; migrations are generated by Drizzle Kit into `src/db/migrations`.
