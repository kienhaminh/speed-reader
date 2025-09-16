# Phase 1: Quickstart (Local Dev)

## Prereqs

- Node.js LTS, pnpm or npm
- Docker + docker-compose
- Gemini API key in environment

## 1) Start Postgres

```bash
docker compose up -d
```

Compose file (to be added at repo root): defines `db` (PostgreSQL) and `app` (Next.js) services.

## 2) Create Next.js app (App Router)

```bash
pnpm create next-app speed-reader --ts --eslint --tailwind --src-dir --app --import-alias "@/*"
```

## 3) Install dependencies

```bash
cd speed-reader
pnpm add drizzle-orm pg dotenv zod
pnpm add -D drizzle-kit @playwright/test vitest
```

## 4) Add shadcn/ui

```bash
pnpm dlx shadcn@latest init -d
```

## 5) Configure Drizzle

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## 6) Run dev

```bash
pnpm dev
```

## 7) Verify health

- Open http://localhost:3000
- Hit API endpoints under /api (per contracts)
