# PSS PDF portal — stack audit

Phase 1 only. Nothing outside `portal/` was edited. Branch `pss/portal` was created from `origin/pss/main` (`48c4d73e9`) and is not committed.

Sources, read-only:

| Source | Path | Commit |
|---|---|---|
| PSS IT Help Desk | `C:\Users\nlangidrik.RMIPSS.000\Documents\Cursor\Help Desk\PSS-IT-Help-Desk-17` | `1216548` on `main` (`github.com/nlangidrik/PSS-IT-Help-Desk`) |
| Sign-Dock | `C:\Users\nlangidrik.RMIPSS.000\Documents\Cursor\Doc Signer\Doc-Signer` | `b12af56` on `master` (`github.com/nlangidrik/Sign-Dock`) |
| Blueprint | `C:\Users\nlangidrik.RMIPSS.000\Documents\Obsidian Vault\PSS Main\New App Blueprint.md` | snapshot of the Help Desk; the clone wins where they differ |
| This repo | `pss/README.md`, `pss/pruned-paths.txt`, `scripts/pss-license-guard.sh` | `pss/main` |

`portal/` is not in `pss/pruned-paths.txt`. The license guard scans tracked files (`git ls-files`), so this untracked audit is invisible to it until commit. Do not put the proprietary-license title string into any `portal/` file.

The Help Desk checkout’s `node_modules/next` is **16.3.1**. The lockfile and `pnpm.overrides` pin **16.2.6**. This audit follows the lockfile. Proxy behavior was checked against the `v16.2.6` tag (`packages/next/src/lib/constants.ts` sets `PROXY_FILENAME = 'proxy'`), not the drifted install.

---

## Stack and exact versions

`package.json` declares `packageManager: pnpm@10.28.2`. Runtime image is `node:20-alpine`. Next’s engine field on 16.2.6 is `node >= 20.9.0`.

Declared ranges (lockfile resolution in parentheses when it differs):

| Package | Declared | Lockfile |
|---|---|---|
| next | `^16.2.6` | **16.2.6** (also the override) |
| react / react-dom | `^18.2.0` | 18.3.1 |
| next-auth | `^4.24.13` | 4.24.13 |
| @auth/core | 0.41.0 | 0.41.0 |
| @prisma/client, prisma | 6.9.0 | 6.9.0 |
| typescript | `^5` | (caret, not pinned) |
| eslint | `^9.39.4` | |
| eslint-config-next | `^16.2.3` | 16.2.3 |
| vitest | `^4.1.2` | |
| @playwright/test | `^1.58.1` | 1.59.1 |
| tailwindcss | `^3.4.17` | |
| next-themes | `^0.4.4` | 0.4.6 |
| nodemailer | `^8.0.5` | 8.0.5 (override) |
| bcryptjs | `^3.0.2` | auth uses this, not the `bcrypt` package |
| zod | `^3.25.76` | password rules |

`pnpm.overrides` (copy this block as-is):

```json
"brace-expansion@5.0.5": "5.0.6",
"diff": "4.0.4",
"dompurify": "3.4.7",
"fast-xml-parser": "5.5.7",
"lodash": "4.18.1",
"next": "16.2.6",
"nodemailer": "8.0.5",
"ip-address": "10.2.0",
"picomatch": "4.0.4",
"postcss": "8.5.14",
"preact": "10.27.3",
"uuid": "11.1.1"
```

Help Desk `AGENTS.md` still says the override is `next@16.2.3` and `lodash@4.17.23`. `package.json` and the lockfile are newer. Follow `package.json`.

Scripts that matter:

- `lint` = `eslint . && tsc --noEmit` (the only typecheck; `next.config.mjs` sets `typescript.ignoreBuildErrors: true`)
- `test` / `test:run` = `vitest run app/api`
- `db:seed` = `prisma db seed` → `ts-node prisma/seed.ts`
- `dev` / `build` / `start` = `next dev` / `next build` / `next start`

`tsconfig.json` path alias `@/*` → `./*`. It excludes `**/*.test.ts`, `scripts/`, and `prisma/seed.ts`, so `pnpm lint` does not typecheck those. ESLint still lints tests.

There is no `pnpm-workspace.yaml` in the Help Desk. One package, app at the project root. The portal package root is `portal/`.

---

## UI, theme, landing, sidebar, header

Tailwind 3, `darkMode: 'class'`, shadcn-style kit in `components/ui/` (`components.json`: style `default`, RSC, CSS variables, base color `neutral`, icon library `lucide`). Class merging is `cn()` in `lib/utils.ts` (`clsx` + `tailwind-merge`). Buttons use `class-variance-authority`.

Tokens in `app/globals.css`:

- Light `--primary: 210 100% 20%` (commented “PSS blue”), `--secondary: 47 100% 50%` (PSS gold), `--ring` matches primary, `--radius: 0.5rem`.
- `.dark` flips background/foreground and sets `--primary` to a light slate; gold secondary stays.
- `tailwind.config.ts` maps those HSL variables and adds `pss-blue` **`#003366`** / light `#0066cc`, `pss-gold` `#8B7355`.

Dark mode: `app/layout.tsx` injects a tiny script that adds `class="dark"` from `localStorage.theme` or `prefers-color-scheme` before paint. `app/providers.tsx` wraps `SessionProvider` → `ThemeProvider` (`next-themes`, `attribute="class"`, `defaultTheme="light"`, `enableSystem`) → `ClientLayout` + `Toaster` (`components/ui/sonner`). `components/theme-provider.tsx` is a pass-through over `next-themes`.

Landing (`app/page.tsx`): server component; session redirects to `/dashboard/tickets`, otherwise `components/LandingClient.tsx`. Full-viewport navy `#0b1628`, inline `<style>`, floating particles, stick-chart SVG, Inter from Google Fonts, one Google button: `signIn("google", { callbackUrl: "/dashboard/tickets" })`. Logo component `components/pss-logo.tsx` loads a **remote Vercel blob URL**, not a file in `public/`.

Sidebar (`components/sidebar.tsx`): client component, navy `border-blue-800`, logo button signs out to `/`, app title, `NavGroup[]` links, Log Out. Mobile drawer via `Menu` / `X`. Image is `/logo.png`. Dashboard shell (`app/dashboard/layout.tsx`) is sidebar + `<main>` on `bg-gray-50 dark:bg-slate-900`. It does **not** render `components/header.tsx`.

Header (`components/header.tsx`): “Welcome back, {name}”, avatar dropdown (profile, settings, sign out to `/`). Present, unused by the dashboard shell.

`components/ui/` is the full Radix set (48 files): accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip, use-mobile. `chart.tsx` imports `recharts`.

`ClientLayout` also mounts a chat widget and a global loader. Those are Help Desk product UI.

---

## NextAuth

Wired config is `lib/auth.ts`. `lib/auth.config.ts` is unused (30-day session, nothing imports it). Do not copy it.

Providers:

- Google, only if both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are non-empty. Authorization params today: `prompt=consent`, `access_type=offline`, `response_type=code`, `scope=openid email profile`. No `hd`. `httpOptions.timeout` 30000.
- Credentials always: email + password, `bcryptjs.compare`, returns `id`, `email`, `name`, `role`, `mustChangePassword`. Missing user or password returns `null`.

Session: JWT, `maxAge: 7 * 24 * 60 * 60`. Pages: `signIn: "/"`, `error: "/"`. Secret: `NEXTAUTH_SECRET`.

`signIn` callback:

- Google: `findUnique` by `profile.email`; if missing, `create` with `role: "USER"`. No domain check, no `email_verified` check, no active/deleted check. Errors return `false`.
- Credentials: find the user again and return true if the row exists.

`jwt`: on `user`, copies `role`, `id`, `mustChangePassword`. No `trigger` argument. Claims stay stale until the cookie expires.

`session`: copies those three fields onto `session.user` (mustChangePassword via a cast).

`types/next-auth.d.ts` types `id`, `email`, `name`, `role` on Session and User, and `role` on JWT. It does not declare `mustChangePassword`.

Route `app/api/auth/[...nextauth]/route.ts`: `NextAuth(authOptions)` wrapped by `lib/rate-limit.ts`. Window 15 minutes, max 100. GET skips the limiter for `session`, `providers`, and `csrf`. POST always limits. 429 JSON with `X-RateLimit-*` headers. Params handled as a Promise (Next 15+) or a plain object.

`/admin` (`app/admin/page.tsx`): client form, `signIn("credentials", { redirect: false, callbackUrl: searchParams.callbackUrl || "/dashboard/admin" })`, then `router.push`. Dark glass layout, same particle background as the landing page. This is the credentials flow.

`mustChangePassword`:

- Column `Boolean @default(true)` on `User`.
- Seeded admin relies on that default (the seed `create` does not set the field).
- `POST /api/reset-password` requires a session, validates with zod (12+ chars, upper, lower, digit, symbol), `bcrypt.hash(..., 12)`, sets `mustChangePassword: false`.
- Page `app/reset-password/page.tsx` posts there and then sends the browser to `/admin`.
- **No page, layout, or proxy reads the flag to force that page.** The flag is stored and cleared. Sign-Dock is the app that actually redirects: `app/dashboard/layout.tsx` sends `mustChangePassword` users to `/dashboard/profile/password?forcePasswordChange=1`.

---

## RBAC and `proxy.ts`

`lib/auth-helpers.ts`:

| Helper | Behavior |
|---|---|
| `requireAuth()` | `getServerSession`; null unless `session.user.email` |
| `requireAdmin()` | session, then `findUnique` by email; allowed roles `SUPER_ADMIN`, `IT_MANAGER`, `IT_TECH` |
| `requireSuperAdmin()` | `SUPER_ADMIN`, `IT_MANAGER` |
| `requireRole(allowedRoles)` | same lookup, caller-supplied list |
| `getCurrentUser()` | session, then the user row |
| `canAccessResource(resourceUserId)` | admins, or `currentUser.id === resourceUserId` |

Roles in the schema: `USER`, `SUPER_ADMIN`, `IT_MANAGER`, `IT_TECH`. There is no `ADMIN` and no `isActive` / `deletedAt`.

`proxy.ts` (project root, next to `app/`):

```ts
export default async function proxy(req: NextRequest) { ... }
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|manifest.webmanifest).*)"],
};
```

Public paths that return `NextResponse.next()`: `/`, `/admin`, `/manifest.webmanifest`, `/api/*`, `/_next/*`, `/uploads/*`, `/favicon.ico`. Anything else without a JWT (`getToken` + `NEXTAUTH_SECRET`) redirects to `/`.

**Does it run on Next 16?** Yes. Next 16.2.6 defines `PROXY_FILENAME = 'proxy'` as the replacement for `middleware`. A root `proxy.ts` is the convention file. The Help Desk export is a default export whose function is named `proxy`, which is the shape the 16 docs accept (default export or named `proxy`). Help Desk `AGENTS.md` says the file is dead and must be renamed to `middleware.ts`. That note is out of date for this Next version. Leave the filename as `proxy.ts`. The proxy runtime is Node.js; the edge runtime is not available on `proxy.ts`. This audit did not boot the Help Desk process to watch a live request.

Help Desk has no `basePath`. With `basePath: "/portal"`, Next strips that prefix before `proxy` sees `nextUrl.pathname`, and `next/link` prefixes it. `fetch("/api/...")` does not. Portal client fetches have to include the base path or they hit the PDF editor.

---

## Audit log, SystemSetting, SMTP

Help Desk has **no** activity/audit table. “Logs” in the blueprint are IMAP `PendingEmail` rows and `logs/email.log`. Sign-Dock is the pattern to follow.

`lib/server/audit.ts` (`writeAuditEvent`): creates `AuditEvent` with `documentId` (required FK to `Document`), `eventType`, `actorEmail`, `actorName`, `ipAddress`, `metadata`. `getClientIp` uses the first `X-Forwarded-For` hop, then `X-Real-IP`, then `NextRequest.ip`, and strips a `::ffff:` prefix. The admin page `app/dashboard/admin/audit-logs/page.tsx` is a table (event, document, actor, IP, time) with no filters.

`SystemSetting` is a CUID row, not a fixed id. Reads everywhere use `prisma.systemSetting.findFirst()` with no `where`. The seed and `app/api/admin/settings/notifications/email/route.ts` still `upsert` `where: { id: "1" }`, which does not match a CUID row. `AGENTS.md` calls that out. The SLA settings route is the working write: `findFirst()`, then `update` that id, or `create` if none.

SMTP password:

- Save (`email/route.ts`): AES-256-CBC, random 16-byte IV, stored as `ivHex:cipherHex`.
- That route’s key handling is unsafe if the env var is missing: it substitutes `crypto.randomBytes(...).slice(0, 32)`.
- `lib/server/email.ts` `getEncryptionKey()` is the strict check: missing or not exactly 32 characters throws. Decrypt splits on `:`, `createDecipheriv`, and on failure returns the original string.
- `EMAIL_ENCRYPTION_KEY` is required in `.env.example` with a 32-character placeholder.

---

## Prisma, migrations, seed

PostgreSQL via `provider = "postgresql"`, `url = env("DATABASE_URL")`. Client generator `prisma-client-js`. IDs are `cuid()` except `PendingEmail` (`Int` autoincrement). Timestamps `createdAt @default(now())`, `updatedAt @updatedAt`. **No soft-delete column.** `app/api/admin/delete-user/route.ts` reassigns tickets/responses and then `prisma.user.delete`. The UI copy says soft-delete; the route is a hard delete. `admin@pss.edu.mh` is protected only by `disabled` on the role `<select>`, reset button, and delete button in `UserManagementTable.tsx`. The update and delete routes do not check that email.

Migrations: `prisma/migrations/<timestamp>_<name>/migration.sql` plus `migration_lock.toml` (`provider = "postgresql"`). Docker runs `prisma migrate deploy`. Local `dev.sh` does the same against `.env.local`.

`prisma/seed.ts` (CommonJS, `dotenv` on `.env`):

- Upserts `admin@pss.edu.mh`, name `Super Admin`, role `SUPER_ADMIN`, password **hardcoded** `P@55wordIakwe`, bcrypt cost 10. `mustChangePassword` left to the schema default `true`.
- Also upserts the Liktanur automation user and a `SystemSetting` row at `id: "1"`.

`lib/prisma.ts`: singleton on `globalThis` outside production.

---

## Docker, scripts, timezone

`Dockerfile`: `node:20-alpine`, `apk add openssl postgresql-client dcron tzdata`, `ENV TZ=Pacific/Majuro`, `npm install -g pnpm` (unpinned), `pnpm install` (**not** `--frozen-lockfile`), CRLF strip on `docker-entrypoint.sh`, `npx prisma generate`, `pnpm run build`, cron install, `ENTRYPOINT ["./docker-entrypoint.sh"]`, `EXPOSE 3000`.

`docker-entrypoint.sh`: `pnpm prisma migrate deploy`, default `TZ` to `Pacific/Majuro`, write cron env, start `crond`, `exec npm start`.

`docker-compose.yml`: service `app` on `3000:3000`, `env_file: .env`, `DATABASE_URL` from the shell, `TZ=Pacific/Majuro`, `depends_on.db.condition: service_healthy`. Healthcheck: Node HTTP GET `http://localhost:3000`, healthy on 200 or 404. DB `postgres:16-alpine`, host `5433:5432`, volume `postgres_data`, network `app-network`, `pg_isready` healthcheck.

`dev.sh`: `docker-compose up db -d`, `pnpm install --frozen-lockfile`, prisma generate + `migrate deploy` via `pnpm dotenv -e .env.local`, then `pnpm dev` (port 3000).

`deploy.sh`: resolves its own directory as the git root, refuses a dirty tracked tree, `git pull --ff-only origin <branch>` (default `main`), `docker compose up -d --build`. Optional `--no-cache` and `--install`.

---

## Vitest and Playwright

`vitest.config.ts`: node environment, `include: **/*.test.ts`, exclude `tests/**/*.spec.ts` and `tests/**/*.test.ts`, `@` alias, `dotenv` loads `.env`.

Route tests sit next to the handler (`app/api/.../route.test.ts`). Pattern:

```ts
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
// or
vi.mock('@/lib/auth', () => ({ getAuthSession: vi.fn() }));
vi.mock('@/lib/auth-helpers', () => ({ requireAdmin: vi.fn() }));
```

`beforeEach` → `vi.clearAllMocks()`. Call the exported `GET`/`POST` with a `Request`. Assert `response.status` and `await response.json()`. No test database. `next-test-api-route-handler` is a devDependency; the route tests that were read call the handler directly and do not use it.

Playwright (`playwright.config.ts`): `testDir: ./tests`, chromium only, `baseURL: http://localhost:3000`, loads `.env.local`, `globalTeardown: ./global-teardown.ts`, project `setup` matches `*.setup.ts` and chromium depends on it. `webServer`: `pnpm dev`, `reuseExistingServer: true`, 120s timeout. `tests/auth.setup.ts` upserts three users with bcrypt passwords and `mustChangePassword: false`, then saves `playwright/.auth/*.json`. Workers: 4 local, 1 on CI.

---

## What will be mirrored, and how

Help Desk files are the implementation. Sign-Dock supplies brand, the audit writer, the JWT refresh, and the admin-section gate. Ticket, AI, IMAP, n8n, chat, and the DSC stylesheet block stay out.

| Portal file | Source | How |
|---|---|---|
| `package.json` | Help Desk `package.json` | Same scripts for lint/test/seed/dev/build/start. Same version ranges for every dependency the copied files import. Full `pnpm.overrides` and `packageManager` pin. New lockfile from that subset (do not copy the Help Desk lock; it pulls AI, IMAP, and PDF). |
| `next.config.mjs` | Help Desk | Same `ignoreBuildErrors`, `images.unoptimized`, `turbopack.root`. Add `basePath: "/portal"`. |
| `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `vitest.config.ts` | Help Desk | Copy. Drop eslint ignores for files we do not copy. |
| `tailwind.config.ts`, `app/globals.css` | Help Desk | Copy tokens, `pss-blue` `#003366`, dark class. Omit `.dsc-surface`. |
| `app/layout.tsx`, `app/providers.tsx`, `components/theme-provider.tsx` | Help Desk | Copy. Title “PSS PDF”. Providers without the chat widget. |
| `components/ui/**` | Help Desk | Copy the kit so Radix imports stay intact. |
| `components/sidebar.tsx`, `components/header.tsx`, `app/dashboard/layout.tsx` | Help Desk shell; Sign-Dock brand usage | Same sidebar structure and dashboard shell (header component kept, not mounted, matching Help Desk). Nav items are portal pages. Logo and title from `lib/brand.ts`. |
| `components/LandingClient.tsx`, `app/page.tsx`, `app/admin/page.tsx` | Help Desk | Same landing and admin-login visuals. Button label “Sign in with Google — PSS account”. Logged-in landing goes to `/dashboard`. |
| `components/pss-logo.tsx`, `public/pss-logo.png`, `public/favicon.ico`, `public/favicon.png` | Sign-Dock assets; Help Desk component shape | Local `LOGO_PATH`, not the Vercel blob and not `/logo.png`. |
| `lib/brand.ts` | Sign-Dock shape | `APP_NAME` “PSS PDF”, `ORG_NAME` “RMI Public School System”, `LOGO_PATH` “/pss-logo.png”, one-line `APP_DESCRIPTION`. |
| `lib/auth.ts` | Help Desk, plus Sign-Dock `jwt` `trigger === "update"` | Google auto-create `role: "USER"`. Credentials admin. 7-day JWT. Additions: `hd` and `@pss.edu.mh` + `email_verified` before create; reject inactive or soft-deleted. |
| `lib/auth-helpers.ts` | Help Desk | Same function names. `requireAdmin` allows `ADMIN` only. |
| `lib/rate-limit.ts`, `app/api/auth/[...nextauth]/route.ts` | Help Desk | Copy. Gate route does not call the limiter (the limiter only wraps NextAuth). |
| `proxy.ts` | Help Desk | Keep the name. Public: `/`, `/login`, `/admin`, static, `/api`. Everything else needs a JWT. Paths are without `/portal` because Next strips `basePath`. |
| `lib/prisma.ts`, `lib/utils.ts` | Help Desk | Copy. |
| `lib/server/email.ts` + SMTP route | Help Desk `getEncryptionKey` + AES save | `findFirst()` then update/create. Throw if the key is missing. No random-key fallback. |
| `lib/server/audit.ts` | Sign-Dock | Same writer and `getClientIp`. No `documentId` (see decisions). |
| `app/dashboard/admin/layout.tsx` | Sign-Dock | Client layout; non-`ADMIN` redirected off the section. |
| `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` | Help Desk conventions | New models only: `User`, `SystemSetting`, `AuditEvent`. Seed `admin@pss.edu.mh`, role `ADMIN`, `mustChangePassword: true`, password from `ADMIN_SEED_PASSWORD`. |
| `Dockerfile`, `docker-entrypoint.sh` | Help Desk | Node 20 Alpine, TZ `Pacific/Majuro`, CRLF fix, `prisma generate`, build. No cron. Entrypoint: `migrate deploy`, then `npm start`. |
| `docker-compose.yml` | Help Desk shape, portal names | Services `portal` (`pss-pdf-portal`, `3002:3000`) and `portal-db` (`postgres:16-alpine`, `pss-pdf-portal-db`, `5435`, volume `pss_pdf_portal_pg`). Network `pss-pdf-portal-network`. |
| `dev.sh`, `deploy.sh` | Help Desk | `dev.sh` starts `portal-db` and uses `.env.local`. `deploy.sh` pulls `pss/main` from the PSS-PDF git root and runs `docker compose -f portal/docker-compose.yml up -d --build`. |
| `.env.example` | Help Desk structure | Placeholders only. Names from the prompt: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL` (`portal-db` inside Docker), `POSTGRES_*`, `EMAIL_ENCRYPTION_KEY` (32 chars), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_GOOGLE_DOMAIN`, `ADMIN_SEED_PASSWORD`. |
| `app/api/gate/route.ts` + `route.test.ts` | Help Desk route-test style | New. `dynamic = "force-dynamic"`. |
| `AGENTS.md`, `README.md`, `deploy/nginx-pdf.pss.edu.mh.conf` | Help Desk `AGENTS.md` style; nginx from the prompt | Written in Phase 3, not copied. |

---

## Decisions to approve before Phase 2

These are the places the Help Desk has no pattern, or its code disagrees with this prompt. Approving this audit means Phase 2 uses the recommendation in each row.

1. **Dependency subset.** Copy versions and the overrides block. Omit unused product packages (`ai`, `@ai-sdk/react`, `ollama-ai-provider`, `imapflow`, `mailparser`, `pdf-parse`, `pdfjs-dist`, `jspdf`, `html2canvas`, `express-rate-limit`) and omit `husky` (`prepare` would write hooks into the PSS-PDF git dir). Generate a new `pnpm-lock.yaml`.
2. **`basePath`.** Set `basePath: "/portal"`. Proxy matchers stay unprefixed. A tiny helper prefixes `fetch` URLs, because `fetch` does not honor `basePath`.
3. **Local port.** `dev.sh` runs `pnpm dev --port 3002` so it does not take Help Desk’s 3000 or Sign-Dock’s 3001.
4. **Docker install.** `corepack prepare pnpm@10.28.2 --activate` and `pnpm install --frozen-lockfile`. The Help Desk Dockerfile uses an unpinned `npm install -g pnpm` and `pnpm install` without the lock flag. The prompt asks for the pin and the frozen install.
5. **Audit rows.** `AuditEvent` keeps Sign-Dock’s `eventType`, `actorEmail`, `actorName`, `ipAddress`, `metadata`, `occurredAt`, plus optional `targetEmail` for admin user changes. No `documentId`. `writeAuditEvent` / `getClientIp` keep Sign-Dock’s shape otherwise.
6. **Audit filters.** Sign-Dock’s page has none. Add email, event, and from/to on the admin API and three existing inputs on the page.
7. **SystemSetting writes.** `findFirst()` then update that id, or create one CUID row. Do not `upsert` `id: "1"`. Encryption throws when `EMAIL_ENCRYPTION_KEY` is missing or not 32 chars.
8. **Forced password change.** Follow Sign-Dock’s dashboard redirect onto a change-password page that calls the Help Desk `POST /api/reset-password` rules (zod, bcrypt cost 12, flag cleared). Help Desk never redirects on the flag.
9. **Protected admin.** Disable the buttons, and refuse role change and delete of `admin@pss.edu.mh` in the route. Help Desk only disables the buttons.
10. **Soft-delete.** Set `deletedAt` and `isActive: false`. No `prisma.user.delete`. Sign-in and the gate treat either condition as deny.
11. **Google domain.** `hd` and the email suffix both come from `ALLOWED_GOOGLE_DOMAIN`. Missing or blank refuses Google sign-in. `.env.example` value is `pss.edu.mh`.
12. **Healthcheck.** GET `http://localhost:3000/portal`, healthy on 200. Help Desk accepts 200 or 404 on `/`, which would stay green if the portal base path were down.
13. **Playwright.** Copy the config (chromium, `.env.local`, port 3002, base URL `http://localhost:3002/portal`). No e2e specs in this build. Done requires `pnpm test` (Vitest), which includes the gate tests.
14. **`.env.example` is committable.** Repo-root `.gitignore` ignores `.env*`. `portal/.gitignore` will re-include `.env.example` and keep ignoring `.env` and `.env.local`.
15. **`deploy.sh` git root.** The script lives in `portal/` but the git root is the parent repo. It `cd`s to that root, pulls `origin/pss/main`, then compose with `-f portal/docker-compose.yml`.
