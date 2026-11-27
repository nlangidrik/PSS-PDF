# PSS PDF portal — agent guide

## Rules
- The app lives in `portal/` of the PSS-PDF repo. Do not edit the Stirling editor tree from here.
- Never commit `.env` or `.env.local`.
- `pnpm lint` (`eslint . && tsc --noEmit`) is the only typecheck. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`.

## Stack
- Next.js 16.2.6 (App Router, `basePath: "/portal"`), React 18, next-auth 4.24, Prisma 6.9, PostgreSQL 16
- pnpm 10.28.2. `pnpm-workspace.yaml` keeps this directory its own workspace.
- Vitest for `app/api` route tests. Playwright config is present; there are no e2e specs.

## Critical commands
| Command | What it does |
|---|---|
| `bash dev.sh` | Start `portal-db` on 5435, migrate with `.env.local`, `pnpm dev --port 3002` |
| `pnpm lint` | ESLint and `tsc --noEmit` |
| `pnpm test` | `vitest run app/api` |
| `pnpm db:seed` | Seed `admin@pss.edu.mh` from `ADMIN_SEED_PASSWORD` |
| `bash deploy.sh` | From the git root: pull `pss/main`, then `docker compose -f portal/docker-compose.yml up -d --build` |

## Architecture
- `app/` pages and route handlers. `app/layout.tsx` → `app/providers.tsx` (`SessionProvider` base path `/portal/api/auth`, theme, toaster).
- `proxy.ts` is the Next 16 request proxy (do not rename it to `middleware.ts`). It checks the JWT only.
- `lib/auth.ts` is the NextAuth config. `lib/auth-helpers.ts` is `requireAuth`, `requireAdmin`, `getCurrentUser`.
- `GET /api/gate` is the nginx `auth_request` target. It re-reads the user from Postgres.

## Auth and RBAC
- Google sign-in creates a `USER` on first success. `hd` and the email suffix come from `ALLOWED_GOOGLE_DOMAIN`. Missing domain, unverified email, inactive, or soft-deleted users are rejected.
- Credentials sign-in is the seeded admin at `/admin`. `mustChangePassword` sends them to `/dashboard/profile/password`.
- JWT sessions last 7 days. `trigger: "update"` reloads role, name, and `mustChangePassword` from the database. The OAuth subject is not the portal user id; the token stores the Prisma id looked up by email.
- Roles are `USER` and `ADMIN`. `admin@pss.edu.mh` cannot be re-roled, deactivated, or deleted.
- Client `fetch` calls go through `withBasePath`. `next/link` does not need it. The editor link is a plain `<a href="/">`.

## Gate
- `GET /api/gate` returns 204 with `X-PSS-User-Email` and `X-PSS-User-Role`, or 401 with an empty body.
- `export const dynamic = "force-dynamic"`. No writes. Not rate limited.
- A user who is missing, inactive, soft-deleted, or outside the domain is 401 even when the JWT is still valid.

## Docker and ports
- `pss-pdf-portal` publishes `3002:3000`. `pss-pdf-portal-db` publishes `5435:5432`. Volume `pss_pdf_portal_pg`. Network `pss-pdf-portal-network`.
- Timezone `Pacific/Majuro`. Entrypoint runs `prisma migrate deploy`, then `npm start`.
- `DATABASE_URL` inside Compose uses host `portal-db`. `.env.local` uses `localhost:5435`.
- Do not reuse Sign-Dock `3001`/`5434` or the editor's `8090`.

## Quirks
- `NEXTAUTH_URL` includes `/portal`. Login `callbackUrl` values of `/` and `/api/v1/...` return to the editor on the same origin. Other values go to the dashboard.
- `SystemSetting` is a `findFirst()` row. Do not upsert `id: "1"`.
- `EMAIL_ENCRYPTION_KEY` must be exactly 32 characters or SMTP save throws.
- `pnpm test` does not run Playwright.
- The editor container has no login. nginx `auth_request /_pss_gate` is what keeps it private.
