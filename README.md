# TaxHeroes Monorepo

A monorepo containing tax education and gaming applications.

## Quick Start

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start API server (port 5001)
PORT=5001 pnpm --filter @workspace/api-server run start

# Start mockup sandbox (React component preview)
PORT=5173 pnpm --filter @workspace/mockup-sandbox run dev

# Start tax-games (Expo mobile app)
PORT=8081 pnpm --filter @workspace/tax-games run dev

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build
```

**Running now**: API server on http://localhost:5001 (`GET /api/healthz` → `{"status":"ok"}`)

## Overview

This repository contains multiple interconnected applications focused on tax education through interactive experiences:

### Artifacts

| Package | Path | Purpose |
|---------|------|---------|
| `@workspace/api-server` | `artifacts/api-server/` | Node.js/Express API with health check, routing, logging (pino), CORS |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox/` | Vite + React component preview server (UI development) |
| `@workspace/tax-games` | `artifacts/tax-games/` | Expo-based mobile app with tax-themed educational games |
| `@workspace/api-client-react` | `lib/api-client-react/` | Generated React hooks from OpenAPI spec |
| `@workspace/api-zod` | `lib/api-zod/` | Zod schemas for API validation |
| `@workspace/api-spec` | `lib/api-spec/` | OpenAPI 3.1 specification (source of truth for API contracts) |
| `@workspace/db` | `lib/db/` | Drizzle ORM + PostgreSQL schema layer |

## Where Things Live

```
TaxHeroes/
├── artifacts/
│   ├── api-server/          # Node.js API backend
│   │   ├── src/
│   │   │   ├── index.ts     # Entry point (requires PORT)
│   │   │   ├── app.ts       # Express app setup (CORS, JSON, pino logging)
│   │   │   ├── lib/logger.ts
│   │   │   └── routes/      # API routes (currently only /healthz)
│   │   └── build.mjs        # esbuild config
│   ├── mockup-sandbox/       # Vite + React component sandbox
│   └── tax-games/            # Expo mobile app (React Native)
├── lib/
│   ├── api-spec/             # OpenAPI spec → codegen source
│   │   └── openapi.yaml      # API contract definition
│   ├── api-zod/              # Zod schemas (generated + manual)
│   │   └── src/generated/    # Auto-generated from OpenAPI
│   ├── api-client-react/     # Type-safe API client hooks (generated)
│   └── db/                   # Database layer
│       ├── src/
│       │   ├── index.ts      # Drizzle instance (requires DATABASE_URL)
│       │   └── schema/       # Table definitions (currently empty)
│       └── drizzle.config.ts
├── package.json              # Workspace root (pnpm)
├── pnpm-workspace.yaml       # Workspace packages
├── tsconfig.json             # Base TS config
└── README.md
```

**Source-of-truth files**:
- **API contract**: `lib/api-spec/openapi.yaml` → run `pnpm --filter @workspace/api-spec run codegen` to regenerate client + schemas
- **DB schema**: `lib/db/src/schema/` (Drizzle ORM) → run `pnpm --filter @workspace/db run push` to sync to Postgres

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes (api-server) | Server port (e.g., 5001) |
| `DATABASE_URL` | Yes (db-dependent code) | PostgreSQL connection string |
| `NODE_ENV` | No | Environment (development/production) |

## Runs & Operate

- `pnpm --filter @workspace/api-server run dev` — build + start API server (port 5000 by convention)
- `pnpm --filter @workspace/api-server run start` — start built server (requires prior `pnpm run build`)
- `pnpm --filter @workspace/api-server run build` — esbuild bundle → `dist/`
- `pnpm --filter @workspace/mockup-sandbox run dev` — start Vite dev server (port 5173)
- `pnpm --filter @workspace/tax-games run dev` — start Expo dev server (port 8081)
- `pnpm run typecheck` — typecheck all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm approve-builds` — approve packages to run postinstall scripts (e.g., esbuild native binary)

## Stack

- **Package manager**: pnpm workspaces (Node.js 24)
- **Language**: TypeScript 5.9
- **API**: Express 5 (Node.js)
- **Logging**: pino + pino-http + pino-pretty
- **Middleware**: cors, cookie-parser, express.json/urlencoded
- **Validation**: Zod (v4) + drizzle-zod
- **Database**: PostgreSQL + Drizzle ORM
- **Build**: esbuild (CJS bundle with ESM output)
- **Codegen**: Orval (from OpenAPI spec) → `@workspace/api-client-react`
- **Frontends**:
  - mockup-sandbox: Vite + React + Tailwind CSS + Radix UI
  - tax-games: Expo SDK 54 + React Native + React Navigation

## API Endpoints

Currently only health check is implemented:

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/healthz` | Returns `{"status":"ok"}` |

## Architecture Decisions

- **Monorepo with pnpm workspaces** — shared dependencies, atomic changes across packages
- **OpenAPI-first API design** — spec in `lib/api-spec/` is source-of-truth; client + schemas generated via Orval
- **Drizzle ORM for Postgres** — type-safe queries, schema-as-code, zod integration for validation
- **esbuild for bundling** — fast native binary bundler; CJS entry point wraps ESM bundle for Node compatibility
- **pino structured logging** — JSON logs in production; pino-pretty dev transport via esbuild plugin
- **Express 5** — modern middleware stack; no framework lock-in for potential future migration
- **Frontends separated as artifacts** — mockup-sandbox for UI dev, tax-games as standalone mobile app; both consume generated API client

## Product

TaxHeroes aims to make tax education engaging through:
- Interactive tax-themed mobile games (tax-games)
- Educational UI component library and sandbox (mockup-sandbox)
- Backend services to support game logic, user data, and progress tracking

## User Preferences

- Use `pnpm` (not npm/yarn) for all workspace operations
- Run `pnpm run build` before production deploys
- Prefer generated API client (`@workspace/api-client-react`) over manual fetch calls
- DB migrations: use `pnpm --filter @workspace/db run push` for dev; use proper migration tool for prod (to be added)

## Gotchas

- **esbuild native binary**: If you see "could not find package @esbuild/darwin-arm64", run `pnpm approve-builds esbuild` to allow the postinstall script to download the platform binary.
- **Preinstall guard**: Root `package.json` has a `preinstall` script that prevents non-pnpm usage; set `npm_config_user_agent=pnpm/*` if you need to bypass.
- **Port 5000 conflict**: On Replit/development, port 5000 may be occupied by system processes; use 5001 for api-server locally.
- **DATABASE_URL required**: Any code importing `@workspace/db` will throw at module init if `DATABASE_URL` is unset. Use a `.env` file or export in shell.
- **Generated code must be committed**: Files under `lib/api-client-react/` and `lib/api-zod/src/generated/` are generated from `lib/api-spec/openapi.yaml`. Always regenerate and commit after spec changes.

## License

MIT
