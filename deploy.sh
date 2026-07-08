#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

# Copy the static website exactly as it exists in the repository root,
# while excluding files/folders that should never be deployed as assets.
rsync -av ./ dist/ \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='.wrangler' \
  --exclude='node_modules' \
  --exclude='*.zip' \
  --exclude='*.log' \
  --exclude='package-lock.json' \
  --exclude='pnpm-lock.yaml' \
  --exclude='yarn.lock' \
  --exclude='wrangler.jsonc' \
  --exclude='package.json' \
  --exclude='deploy.sh'

cat > wrangler.jsonc <<'JSON'
{
  "name": "501elite-production",
  "compatibility_date": "2026-07-08",
  "assets": {
    "directory": "dist"
  },
  "observability": {
    "enabled": true
  },
  "compatibility_flags": [
    "nodejs_compat"
  ]
}
JSON

npx wrangler deploy --config wrangler.jsonc
