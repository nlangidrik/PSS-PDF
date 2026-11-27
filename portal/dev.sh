#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

docker compose up portal-db -d

pnpm install --frozen-lockfile
pnpm dotenv -e .env.local -- pnpm exec prisma generate
pnpm dotenv -e .env.local -- pnpm exec prisma migrate deploy

pnpm dev --port 3002
