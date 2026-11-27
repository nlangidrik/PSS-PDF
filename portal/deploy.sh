#!/bin/bash
set -euo pipefail

SOURCE="${BASH_SOURCE[0]}"
while [ -L "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
PORTAL_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
REPO_DIR="$(cd -P "$PORTAL_DIR/.." && pwd)"

cd "$REPO_DIR"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "deploy: tracked files have local changes. Commit, stash, or discard them first:" >&2
  git status --short --untracked-files=no >&2
  exit 1
fi

git fetch origin pss/main
git checkout pss/main
git pull --ff-only origin pss/main

docker compose -f portal/docker-compose.yml up -d --build
docker compose -f portal/docker-compose.yml ps
