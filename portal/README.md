# PSS PDF portal

Sign-in front door for the PSS PDF editor. Staff use a `@pss.edu.mh` Google account. The editor itself has no login; nginx allows a request through only when `GET /portal/api/gate` returns 204.

Public hostname comes from `NEXTAUTH_URL` (production: `https://pdf.pss.edu.mh/portal`).

## Environment

Copy `.env.example` to `.env` for Docker and to `.env.local` for `dev.sh`. Never commit those copies.

| Variable | Purpose |
|---|---|
| `NEXTAUTH_URL` | This app’s public origin, including `/portal`. Local: `http://localhost:3002/portal` |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `DATABASE_URL` | Docker: host `portal-db`, port 5432. Local: `localhost:5435` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Database `pss_pdf_portal` |
| `EMAIL_ENCRYPTION_KEY` | Exactly 32 characters. Encrypts the SMTP password |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth. Both must be set or Google sign-in is off |
| `ALLOWED_GOOGLE_DOMAIN` | `pss.edu.mh`. Empty rejects every Google sign-in |
| `ADMIN_SEED_PASSWORD` | Initial password for `admin@pss.edu.mh`. The seed exits if this is unset |

`.env.local` example database URL:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/pss_pdf_portal"
NEXTAUTH_URL="http://localhost:3002/portal"
```

## Google OAuth

In the `pss.edu.mh` Google Cloud project, create an OAuth client:

- User type: **Internal**
- Authorized redirect URI: `https://pdf.pss.edu.mh/portal/api/auth/callback/google`
- JavaScript origin: `https://pdf.pss.edu.mh`

Put the client id and secret in `.env`. The portal also sends `hd=pss.edu.mh` and rejects any account that is not verified or not on that domain.

## Local development

Requires Docker (for Postgres) and pnpm 10.28.2.

```bash
cp .env.example .env.local
# set NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL (localhost:5435), ADMIN_SEED_PASSWORD
bash dev.sh
```

`dev.sh` starts `portal-db` on port 5435, applies migrations, and runs Next on port 3002.

Seed the admin after the database is up:

```bash
pnpm dotenv -e .env.local -- pnpm db:seed
```

Sign in at `http://localhost:3002/portal/admin` with `admin@pss.edu.mh`. The first login must change that password.

## Docker deploy

On the app VM, from a checkout of `pss/main`:

```bash
bash portal/deploy.sh
```

That pulls `origin/pss/main` and runs `docker compose -f portal/docker-compose.yml up -d --build`.

| Service | Container | Host port |
|---|---|---|
| portal | `pss-pdf-portal` | 3002 |
| portal-db | `pss-pdf-portal-db` | 5435 |

These names and ports are not shared with Sign-Dock (3001 / 5434) or the PDF editor (8090). The container clock is `Pacific/Majuro`.

## nginx

Install `portal/deploy/nginx-pdf.pss.edu.mh.conf` on the nginx host. Certificate paths in that file are placeholders.

- `/portal/` proxies to `192.168.84.23:3002`
- `/` proxies to the editor on `192.168.84.23:8090` after `auth_request /_pss_gate`
- A 401 from the gate redirects to `/portal/login?callbackUrl=$request_uri`

Firewall VM ports 8090 and 3002 so only the nginx host can open them.

Check the file when nginx is installed:

```bash
nginx -t
```

Include the file from the `http` block. The `map` at the top of the file has to live in `http`, not inside `server`.

## Backup and restore

The portal database is `pss_pdf_portal` on host port 5435. There is no backup button in the app.

Backup:

```bash
pg_dump -h localhost -p 5435 -U postgres -d pss_pdf_portal -Fc -f pss_pdf_portal.dump
```

Restore into an empty database:

```bash
pg_restore -h localhost -p 5435 -U postgres -d pss_pdf_portal --clean --if-exists pss_pdf_portal.dump
```

Inside Docker, run `pg_dump` with host `portal-db` and port 5432. Keep dumps outside the git tree.

## How the editor is gated

1. A browser request for anything other than `/portal/` hits nginx `location /`.
2. nginx calls `GET /portal/api/gate` with the session cookie and no body.
3. The gate returns 204 only when the JWT session matches a database user who is active, not soft-deleted, and on `@pss.edu.mh`.
4. Otherwise nginx redirects to `/portal/login?callbackUrl=...`.
5. After Google sign-in, the browser is sent back to that same-origin path.
6. Deactivating or soft-deleting a user does not wait for the JWT to expire. The next editor request is denied because the gate reads the database.

`/portal/dashboard` has an **Open PDF Editor** link to `/`, which is the editor, not another portal page.
