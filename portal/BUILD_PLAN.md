# PSS PDF portal — build plan

Phase 2. Implements the approved `STACK_AUDIT.md` decisions. No application code until this plan is approved.

The app lives only in `portal/`. Public URL prefix is `/portal` (`basePath`). The PDF editor stays the existing `pss/main` container on VM port 8090. nginx is the only thing that joins them.

## Feature scope

In:

- Google sign-in for `@pss.edu.mh` staff, first sign-in creates `USER`
- Credentials sign-in for seeded `admin@pss.edu.mh` at `/portal/admin`, forced password change
- JWT sessions, 7 days, refreshed from the database when the client calls `update()`
- Admin: user list and search, role, activate/deactivate, soft-delete, activity log, SMTP settings
- `GET /portal/api/gate` for nginx `auth_request`
- Docker compose on ports 3002 and 5435, nginx config, docs

Out:

- Ticket, AI, IMAP, n8n, chat widget, DSC theme, knowledge base, invitations, backup UI
- Playwright specs (config only)
- Editing anything outside `portal/`, including `.github/`
- Logging gate requests

## Folder layout

```
portal/
  package.json
  pnpm-lock.yaml
  next.config.mjs
  tsconfig.json
  eslint.config.mjs
  postcss.config.mjs
  tailwind.config.ts
  vitest.config.ts
  playwright.config.ts
  components.json
  proxy.ts
  Dockerfile
  docker-entrypoint.sh
  docker-compose.yml
  dev.sh
  deploy.sh
  .env.example
  .gitignore
  .dockerignore
  AGENTS.md
  README.md
  prisma/schema.prisma
  prisma/seed.ts
  prisma/migrations/<timestamp>_init/migration.sql
  prisma/migrations/migration_lock.toml
  public/pss-logo.png
  public/favicon.ico
  public/favicon.png
  types/next-auth.d.ts
  lib/auth.ts
  lib/auth-helpers.ts
  lib/brand.ts
  lib/prisma.ts
  lib/rate-limit.ts
  lib/utils.ts
  lib/callback-url.ts
  lib/server/audit.ts
  lib/server/email.ts
  components/LandingClient.tsx
  components/header.tsx
  components/sidebar.tsx
  components/theme-provider.tsx
  components/pss-logo.tsx
  components/UserManagementTable.tsx
  components/ui/          # Help Desk kit, copied
  app/globals.css
  app/layout.tsx
  app/providers.tsx
  app/page.tsx
  app/login/page.tsx
  app/logout/page.tsx
  app/admin/page.tsx
  app/dashboard/layout.tsx
  app/dashboard/page.tsx
  app/dashboard/profile/password/page.tsx
  app/dashboard/admin/layout.tsx
  app/dashboard/admin/page.tsx
  app/dashboard/admin/users/page.tsx
  app/dashboard/admin/audit-logs/page.tsx
  app/dashboard/admin/settings/page.tsx
  app/api/auth/[...nextauth]/route.ts
  app/api/gate/route.ts
  app/api/gate/route.test.ts
  app/api/logout/route.ts
  app/api/reset-password/route.ts
  app/api/admin/list-users/route.ts
  app/api/admin/update-user/route.ts
  app/api/admin/delete-user/route.ts
  app/api/admin/audit-logs/route.ts
  app/api/admin/settings/email/route.ts
  deploy/nginx-pdf.pss.edu.mh.conf
```

Paths below are Next paths. The browser prefixes `/portal`.

Comments in new files follow this repo’s comment standard (`task comment-lint` scans the branch diff). Do not copy Help Desk narration comments.

## Environment

`portal/.env.example` is committed. Root `.gitignore` ignores `.env*`, so `portal/.gitignore` re-includes `.env.example` and ignores `.env` and `.env.local`.

| Name | Example | Where it is used |
|---|---|---|
| `NEXTAUTH_URL` | `https://pdf.pss.edu.mh/portal` | NextAuth. Local: `http://localhost:3002/portal` |
| `NEXTAUTH_SECRET` | generated placeholder | JWT |
| `NODE_ENV` | `development` | |
| `DATABASE_URL` | `postgresql://postgres:postgres@portal-db:5432/pss_pdf_portal` | Compose. `.env.local` uses `localhost:5435` |
| `POSTGRES_USER` | `postgres` | `portal-db` |
| `POSTGRES_PASSWORD` | `postgres` | `portal-db` |
| `POSTGRES_DB` | `pss_pdf_portal` | `portal-db` |
| `EMAIL_ENCRYPTION_KEY` | 32-character placeholder | AES-256-CBC. App throws if missing or not 32 chars |
| `GOOGLE_CLIENT_ID` | empty placeholder | Google provider omitted when either Google var is empty |
| `GOOGLE_CLIENT_SECRET` | empty placeholder | |
| `ALLOWED_GOOGLE_DOMAIN` | `pss.edu.mh` | `hd` and the email suffix. Missing or blank rejects Google sign-in |
| `ADMIN_SEED_PASSWORD` | placeholder, not a real password | Seed only. Seed exits if unset |

No IMAP, Ollama, or n8n variables.

## Prisma

PostgreSQL. IDs are `cuid()`. One migration, `provider = "postgresql"` in `migration_lock.toml`.

```prisma
enum Role {
  USER
  ADMIN
}

enum AuditEventType {
  SIGN_IN
  SIGN_IN_DENIED
  SIGN_OUT
  ADMIN_LOGIN
  USER_ROLE_CHANGED
  USER_ACTIVATED
  USER_DEACTIVATED
  USER_SOFT_DELETED
}

model User {
  id                 String    @id @default(cuid())
  name               String
  email              String    @unique
  password           String?
  image              String?
  role               Role      @default(USER)
  isActive           Boolean   @default(true)
  deletedAt          DateTime?
  mustChangePassword Boolean   @default(true) @map("mustChangePassword")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

model SystemSetting {
  id            String   @id @default(cuid())
  smtpServer    String?
  smtpPort      Int?
  smtpSecurity  String?
  smtpUsername  String?
  smtpPassword  String?
  smtpFromEmail String?
  updatedAt     DateTime @updatedAt
}

model AuditEvent {
  id          String         @id @default(cuid())
  eventType   AuditEventType
  actorEmail  String?
  actorName   String?
  targetEmail String?
  ipAddress   String?
  metadata    Json?
  occurredAt  DateTime       @default(now())

  @@index([actorEmail])
  @@index([targetEmail])
  @@index([eventType])
  @@index([occurredAt])
}
```

Emails are stored lowercased.

Seed (`ts-node prisma/seed.ts`, dotenv on `.env`):

- Exit non-zero if `ADMIN_SEED_PASSWORD` is missing.
- Upsert `admin@pss.edu.mh`, name `PSS PDF Admin`, role `ADMIN`, bcrypt cost 10, `mustChangePassword: true`, `isActive: true`, `deletedAt: null`.
- `findFirst` on `SystemSetting`; create one row only when none exists. Do not set `id: "1"`.

Google users are created with `mustChangePassword: false` and no password. The schema default stays `true` so the seeded admin is forced through the password page. Promoting someone to `ADMIN` does not invent a password. Staff, including extra admins, sign in with Google. The seeded row is the only credentials account.

## Auth

`lib/auth.ts` follows the Help Desk file, with these changes:

- Google `authorization.params.hd` is `ALLOWED_GOOGLE_DOMAIN`. If that variable or either Google client value is missing, the Google provider is not registered and a Google `signIn` returns false.
- `signIn` for Google, before any create:
  1. Missing email, or `profile.email_verified !== true` → deny, reason `unverified` (missing email uses reason `missing_email`).
  2. Email does not end with `@` + domain, case-insensitive → deny, reason `wrong_domain`.
  3. Existing row with `deletedAt` set → deny, reason `deleted`.
  4. Existing row with `isActive === false` → deny, reason `inactive`.
  5. No row → create `USER`, `mustChangePassword: false`.
  6. Allow, and write `SIGN_IN`.
- A thrown error denies sign-in (reason `error`) and does not create a user.
- Credentials `authorize` returns null when the password does not match, the user is inactive, or `deletedAt` is set. It does not say which.
- Credentials `signIn` writes `ADMIN_LOGIN` on success. Inactive or deleted returns false.
- `jwt` copies `id`, `role`, `mustChangePassword` from `user`. On `trigger === "update"` and `token.id`, it re-reads the row and refreshes `role`, `mustChangePassword`, and `name` (Sign-Dock).
- Session max age is 7 days. `pages.signIn` and `pages.error` are `/login`.
- `events.signOut` is not used for the audit row. The logout route has the request, so it has the client IP.

`lib/callback-url.ts`:

- Allow a relative path that starts with a single `/` and contains no `//`, `\`, or scheme.
- Allow an absolute URL only when its origin equals the origin of `NEXTAUTH_URL`.
- Anything else, including empty, becomes `/dashboard`.
- Editor return paths (`/`, `/api/v1/...`) stay on the site origin and are not prefixed with `/portal`.
- In-app paths (`/dashboard`, `/portal/dashboard`) resolve under `NEXTAUTH_URL`.
- The NextAuth `redirect` callback applies this. `baseUrl` from NextAuth includes `/portal`, so the default “prefix baseUrl” behavior would send staff to the portal instead of the editor.

`lib/auth-helpers.ts`: `requireAuth`, `requireAdmin`, `requireRole`, `getCurrentUser`, `canAccessResource`. `requireAdmin` allows `ADMIN` only. Lookups use the session email.

`proxy.ts` keeps that filename. Matcher matches the Help Desk pattern. Public: `/`, `/login`, `/admin`, `/api/*`, `/_next/*`, `/favicon.ico`. Any other path without a JWT redirects to `/login`. Path checks use the pathname Next passes in, which does not include `/portal`.

Auth route wraps NextAuth with the Help Desk in-memory limiter (15 minutes, 100). GET skips `session`, `providers`, and `csrf`. The gate route does not use it.

Password change: dashboard layout redirects `mustChangePassword` to `/dashboard/profile/password?forcePasswordChange=1` and keeps them there. `POST /api/reset-password` uses the Help Desk zod rules (12+, upper, lower, digit, symbol), bcrypt cost 12, and sets the flag false. The page then calls `useSession().update()`.

## Pages

Browser URLs are the `/portal` forms of these routes.

| Path | Who | What |
|---|---|---|
| `/` | public | Help Desk landing. Session already present → `/dashboard`. Button: “Sign in with Google — PSS account”, callback `/dashboard`. |
| `/login` | public | Same visual language. If a session exists, go to the safe `callbackUrl`. Otherwise the Google button uses that `callbackUrl`. |
| `/admin` | public | Help Desk credentials form. Success → `/dashboard/admin`, then the password redirect if the flag is set. |
| `/logout` | session | POST `/api/logout`, then `signOut` to `/`. Sign-out still runs if the audit write fails. |
| `/dashboard` | session | Name, email, sign-out. Primary link is a plain `<a href="/">` labeled “Open PDF Editor” so it leaves the Next base path and hits nginx. Short list: upload; add, delete, and reorder pages; sign; edit text; add text; redact. |
| `/dashboard/profile/password` | session | Forced first password, and the same form later. |
| `/dashboard/admin` | `ADMIN` | Links to users, activity, settings. |
| `/dashboard/admin/users` | `ADMIN` | Table. |
| `/dashboard/admin/audit-logs` | `ADMIN` | Filtered log. |
| `/dashboard/admin/settings` | `ADMIN` | SMTP form. |

`app/dashboard/layout.tsx` is the Help Desk client shell: sidebar + main, header component present and not mounted. Nav for `USER`: Dashboard. Nav for `ADMIN`: Dashboard, Users, Activity, Settings. Non-admins who open `/dashboard/admin/*` are sent to `/dashboard` by `app/dashboard/admin/layout.tsx` (Sign-Dock).

Sidebar logo and titles come from `lib/brand.ts`. `APP_DESCRIPTION`: “PSS PDF is the RMI Public School System’s PDF editor — staff sign in with a PSS account to upload, arrange, sign, edit, and redact PDFs.”

## Admin API

All of these call `requireAdmin()`. Null → 403 and `{ message: "Forbidden - Admin access required" }`, matching Help Desk list-users. Caught errors → 500.

Protected account constant: `admin@pss.edu.mh`.

| Method | Path | Body / query | Effect |
|---|---|---|---|
| GET | `/api/admin/list-users` | | Users with `deletedAt: null`, ordered by email. Fields: id, name, email, role, isActive. |
| PATCH | `/api/admin/update-user` | `{ email, role? , isActive? }` | Role must be `USER` or `ADMIN`. Role change writes `USER_ROLE_CHANGED`. Active change writes `USER_ACTIVATED` or `USER_DEACTIVATED`. Refuses any role or active change for the protected admin. |
| PATCH | `/api/admin/delete-user` | `{ email }` | Sets `deletedAt` and `isActive: false`. Writes `USER_SOFT_DELETED`. Confirmation is in the client. Refuses the protected admin. Does not call `prisma.user.delete`. |
| GET | `/api/admin/audit-logs` | `email`, `event`, `from`, `to` | `email` matches actor or target. `event` is one `AuditEventType`. `from` / `to` are inclusive dates on `occurredAt`. Newest first. |
| GET | `/api/admin/settings/email` | | `findFirst()`. Password is not returned. Response includes `smtpPasswordSet`. |
| POST | `/api/admin/settings/email` | smtp host, port, security, username, from, optional password | `findFirst()`, then update that id or create one row. Encrypt a new password. A blank password keeps the stored ciphertext. |

User search is client-side on name and email, same as the Help Desk table. The protected admin’s role and delete controls are disabled, and the routes refuse the change anyway.

`lib/server/audit.ts` exports `writeAuditEvent` and `getClientIp` in Sign-Dock’s shape, without `documentId`. `targetEmail` is the user an admin changed.

Recorded events:

| When | Event | Reason metadata |
|---|---|---|
| Google success | `SIGN_IN` | |
| Google or credentials rejected | `SIGN_IN_DENIED` | `wrong_domain`, `unverified`, `missing_email`, `inactive`, `deleted`, `error` |
| Credentials success | `ADMIN_LOGIN` | |
| `POST /api/logout` | `SIGN_OUT` | |
| Role PATCH | `USER_ROLE_CHANGED` | from, to |
| Active PATCH | `USER_ACTIVATED` or `USER_DEACTIVATED` | |
| Delete PATCH | `USER_SOFT_DELETED` | |

No audit row for `/api/gate`.

## Gate

`GET /api/gate`. `export const dynamic = "force-dynamic"`. No writes, no redirect, no body.

204 only when all of these hold:

- Session exists and has an email
- `findUnique` by that email returns a row
- `isActive === true` and `deletedAt` is null
- The row’s email ends with `@` + `ALLOWED_GOOGLE_DOMAIN`

Otherwise 401 with an empty body. Missing domain config is 401.

204 sets `X-PSS-User-Email` and `X-PSS-User-Role`. 401 does not.

`app/api/gate/route.test.ts` mocks `getServerSession` and `prisma.user.findUnique` the way Help Desk route tests do:

| Case | Status |
|---|---|
| Active user, `@pss.edu.mh` | 204 and both headers |
| No session | 401 |
| Email outside the domain | 401 |
| `isActive: false` | 401 |
| `deletedAt` set | 401 |
| No database row | 401 |

`pnpm test` is `vitest run app/api`, so this file is included. No other test files are required.

## Docker and scripts

`Dockerfile`: `node:20-alpine`, `apk add openssl postgresql-client tzdata` (no cron), `ENV TZ=Pacific/Majuro`, Corepack activates `pnpm@10.28.2`, `pnpm install --frozen-lockfile`, CRLF strip on `docker-entrypoint.sh`, `prisma generate`, `pnpm run build`, `EXPOSE 3000`, entrypoint `./docker-entrypoint.sh`.

`docker-entrypoint.sh`: `pnpm prisma migrate deploy`, then `exec npm start`. Timezone defaults to `Pacific/Majuro`.

`docker-compose.yml`:

- `portal`: container `pss-pdf-portal`, `3002:3000`, `env_file: .env`, `TZ=Pacific/Majuro`, depends on `portal-db` healthy. Healthcheck GET `http://localhost:3000/portal`, success on 200.
- `portal-db`: `postgres:16-alpine`, container `pss-pdf-portal-db`, `5435:5432`, volume `pss_pdf_portal_pg`, `pg_isready` healthcheck.
- Network `pss-pdf-portal-network`.

No shared names with Sign-Dock (3001 / 5434) or the editor (8090).

`dev.sh` cds to its own directory, starts `portal-db`, `pnpm install --frozen-lockfile`, prisma generate and `migrate deploy` through `pnpm dotenv -e .env.local`, then `pnpm dev --port 3002`.

`deploy.sh` cds to the PSS-PDF git root (parent of `portal/`), `git pull --ff-only origin pss/main`, then `docker compose -f portal/docker-compose.yml up -d --build`.

## nginx

`portal/deploy/nginx-pdf.pss.edu.mh.conf`. Top comment: VM ports 8090 and 3002 must be reachable only from the nginx host.

- `server_name pdf.pss.edu.mh`
- Port 80 returns 301 to HTTPS
- Certificate paths are placeholders: `/etc/ssl/certs/pdf.pss.edu.mh.crt` and `/etc/ssl/private/pdf.pss.edu.mh.key`
- `location /portal/` proxies to `http://192.168.84.23:3002` and forwards `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`
- `location = /_pss_gate` is `internal`, `proxy_pass http://192.168.84.23:3002/portal/api/gate`, forwards `Cookie`, `proxy_pass_request_body off`, `Content-Length ""`
- `location /` proxies to `http://192.168.84.23:8090` with `auth_request /_pss_gate`
- `auth_request_set $pss_user_email $upstream_http_x_pss_user_email`, and the access log includes `$pss_user_email`
- 401 from the gate uses `error_page 401 = @portal_login`, which returns 302 to `/portal/login?callbackUrl=$request_uri`
- `client_max_body_size 2g`
- `proxy_read_timeout` and `proxy_send_timeout` 600s
- `proxy_request_buffering off` on `location /`
- WebSocket: `proxy_http_version 1.1`, `Upgrade`, and a `map $http_upgrade $connection_upgrade`

`$request_uri` is not re-encoded. A path that itself contains `?` will split the login query string. That matches the requested directive.

## Docs

`portal/AGENTS.md` in the Help Desk guide shape: rules, stack, commands, architecture, auth and RBAC, the gate, Docker ports, and the quirks that bite (`basePath` vs `fetch`, `NEXTAUTH_URL` includes `/portal`, `findFirst()` for settings, proxy filename, seed password from env, editor has no login of its own).

`portal/README.md`:

- Env vars and which file is for Docker vs local
- Google Cloud client: user type Internal, redirect `https://pdf.pss.edu.mh/portal/api/auth/callback/google`, JavaScript origin `https://pdf.pss.edu.mh`
- `./dev.sh`, `./deploy.sh`, and where to install the nginx file
- Backup and restore with `pg_dump` / `psql` against `pss_pdf_portal` (blueprint section 9, database `pss_pdf_portal`, host port 5435). No backup button in the app
- How nginx `auth_request` gates the editor and why a deactivated user loses it on the next request

## Phase 3 checks and commits

Local, from `portal/` unless noted:

- `pnpm lint`
- `pnpm test` (gate cases included)
- `docker compose -f portal/docker-compose.yml config` from the repo root
- `nginx -t` on the config if `nginx` exists; otherwise say it was not run
- `scripts/pss-license-guard.sh` from the repo root

Commits on `pss/portal`, then push and open the PR against `nlangidrik/PSS-PDF` base `pss/main`:

1. scaffold — package, config, theme, UI kit, brand assets
2. auth — NextAuth, proxy, login, landing, password change
3. gate — route and Vitest
4. admin — users, audit, SMTP
5. Docker, nginx, scripts
6. docs — `AGENTS.md`, `README.md`

PR body: what was built, the approved audit decisions, and the result of each check above.
