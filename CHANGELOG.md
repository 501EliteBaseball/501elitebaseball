# Option 1 — Permanent Dist Deploy Fix

## What changed
This replaces the old deploy script that used `rsync`, which Cloudflare does not have.

## Files
- `deploy.sh` now creates a clean `/dist` folder every deployment.
- `wrangler.jsonc` tells Cloudflare to deploy only `/dist`.
- `package.json` keeps the deploy command stable.

## Cloudflare setting
Deploy command should be:

```bash
bash deploy.sh
```

## Upload instructions
Upload these three files to the GitHub root and overwrite existing files:

- deploy.sh
- wrangler.jsonc
- package.json

Then retry deployment.
