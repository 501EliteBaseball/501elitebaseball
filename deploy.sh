#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist
find . -maxdepth 1 -type f \( \
  -name "*.html" -o \
  -name "*.css" -o \
  -name "*.js" -o \
  -name "*.png" -o \
  -name "*.jpg" -o \
  -name "*.jpeg" -o \
  -name "*.webp" -o \
  -name "*.svg" -o \
  -name "*.ico" -o \
  -name "CNAME" \
\) -exec cp -f {} dist/ \;
npx wrangler deploy --config wrangler.jsonc
