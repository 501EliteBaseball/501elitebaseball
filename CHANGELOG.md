# Deployment Fix v2 — Clean Static Assets Deploy

## Changed
- Added `deploy.sh` to create a clean `dist` folder before deployment.
- Added `package.json` with a stable deploy script.
- Added `wrangler.jsonc` pointing Wrangler at `dist`.
- Prevents `node_modules` and oversized dependency files from being deployed.
- Copies all root-level static site assets into `dist`.

## Cloudflare Setting
Set the Cloudflare Deploy command to:

```bash
bash deploy.sh
```

## Upload Instructions
Upload these files to the GitHub repo root:
- deploy.sh
- package.json
- wrangler.jsonc
- CHANGELOG.md

Then retry the Cloudflare deployment.
