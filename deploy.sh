#!/usr/bin/env bash
set -euo pipefail

# Permanent clean deploy:
# 1. Rebuild /dist every time
# 2. Copy only production website assets
# 3. Never deploy node_modules, source zips, or oversized files

rm -rf dist
mkdir -p dist

# Copy root-level production files only.
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
