# how do you feel?

A daily mood tracker you can share. Friends who share their history show up as extra lines on your chart.

Live at [how-do-you-feel.vercel.app](https://how-do-you-feel.vercel.app).

![how do you feel? home screen: a mood form set to 8/10, happy, with tags and a note, beside a history chart plotting six weeks of moods for You, Dawson and Alex](docs/screenshots/home.webp)

## Features

- Log a mood from 0 to 10 each day, with tags and a note.
- A history chart of your moods, with a line for each friend who shares with you.
- Sharing is one-directional and per person: find someone by exact email and choose who sees yours.
- Log from an iOS Shortcut without opening the app.
- Light and dark mode.

## Screenshots

| Sharing moods with friends | Dark mode |
| :-: | :-: |
| <img src="docs/screenshots/connections.webp" alt="Connections dialog: an exact-email search finding Wendy with an add button, and connections Dawson, sharing both ways, and Alex, who shares their mood with you" width="260"> | <img src="docs/screenshots/dark.webp" alt="The home screen in dark mode, with the mood form and the three-person history chart" width="500"> |

## Stack

Next.js 15, React 19, TypeScript, Prisma 6, Postgres, Auth.js, Google OAuth, Recharts, Tailwind v4, shadcn/ui. Hosted on Vercel.

## Running locally

Requires Node 22, pnpm, a Postgres database and a Google OAuth client. Put these in `.env`:

```sh
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

```sh
pnpm install
pnpm prisma:migrate
pnpm dev
```

`pnpm seed` fills the database with sample moods. Other scripts: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm build`.

## iOS Shortcut

The settings menu walks you through adding the app to your home screen and building a Shortcut around your personal API token. The Shortcut posts to `/api/shortcuts/submit` with the token as `Authorization: Bearer <token>`:

```
POST /api/shortcuts/submit?rating=7.5&tags=work,tired&notes=long%20day
```

`date` and `tz` are optional, for logging a day other than today.

<img src="docs/screenshots/mobile-setup.webp" alt="Shortcuts and homescreen setup dialog with steps for adding the app to the home screen and building an iOS Shortcut around the submit URL" width="360">
