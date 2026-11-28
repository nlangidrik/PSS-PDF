#!/bin/sh
set -eo pipefail

echo "Applying Prisma migrations..."
pnpm prisma migrate deploy

export TZ="${TZ:-Pacific/Majuro}"
echo "Container timezone: $TZ ($(date))"

echo "Starting the application..."
exec npm start
