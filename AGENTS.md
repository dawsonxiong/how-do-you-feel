# how-do-you-feel

Personal mood tracker. Log entries, chart them, sign in with Auth.js. Next.js 15 App Router + Prisma + PostgreSQL.

## Commands

```sh
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm format
pnpm prisma:migrate
pnpm seed
```

## Stack — do not swap without asking

Inherits `next16-app` except these **stated deviations**:

- Next.js **15.5**, not 16. `--turbopack` is still passed in scripts.
- **Biome** for lint/format, not oxlint/oxfmt.
- Auth.js (`next-auth` v5) + Prisma adapter. Prisma 6 (not 7).
- Home page is a client island (`src/app/page.tsx`).

## Where to look

- Schema → `prisma/schema.prisma`
- Mood UI → `src/components/MoodEntryForm.tsx`, `MoodChart.tsx`
