# Deployment Fix v2

## What this fixes
- Deploys the static site from a clean `dist` folder.
- Copies all root-level site assets instead of only a few file types.
- Excludes `node_modules`, Git files, zip files, and build junk.
- Prevents Cloudflare Workers from trying to upload oversized dependency files.

## Cloudflare setting
Set Deploy command to:

```bash
bash deploy.sh
```

## Upload instructions
Upload these files to the GitHub repo root:
- `deploy.sh`
- `package.json`
- `wrangler.jsonc`
- `CHANGELOG.md`

## Files detected in current repo root
- 501elitebaseball (1 bytes)
- Bronze_Sponsor_Master.png (2,595,505 bytes)
- Bronze_Sponsor_OriginalStyle_Master.png (1,799,381 bytes)
- Bronze_Sponsor_OriginalStyle_Web.png (2,584,342 bytes)
- CHANGELOG.md (943 bytes)
- CNAME (21 bytes)
- COMMIT_48_NOTES.md (112 bytes)
- COMMIT_49_NOTES.md (130 bytes)
- Gold_Sponsor_Master.png (2,626,505 bytes)
- Gold_Sponsor_OriginalStyle_Master.png (2,048,196 bytes)
- Gold_Sponsor_OriginalStyle_Web.png (2,770,263 bytes)
- LAUNCH_NOTES.txt (454 bytes)
- Logo Vector Cropped.svg (2,938,944 bytes)
- Logo Vector.svg (2,938,964 bytes)
- Platinum_Sponsor_Master.png (2,614,262 bytes)
- Platinum_Sponsor_OriginalStyle_Master.png (1,536,254 bytes)
- Platinum_Sponsor_OriginalStyle_Web.png (2,260,709 bytes)
- README.md (93 bytes)
- README.txt (470 bytes)
- SPRINT_1B_NOTES.md (931 bytes)
- SPRINT_1C_NOTES.md (484 bytes)
- SPRINT_1D_NOTES.md (431 bytes)
- SPRINT_1_NOTES.md (616 bytes)
- Shield Vector.svg (2,026,965 bytes)
- Silver_Sponsor_Master.png (2,586,476 bytes)
- Silver_Sponsor_OriginalStyle_Master.png (1,939,965 bytes)
- Silver_Sponsor_OriginalStyle_Web.png (2,715,816 bytes)
- Title_Sponsor_Master.png (1,349,533 bytes)
- Title_Sponsor_OriginalStyle_Master.png (1,292,333 bytes)
- Title_Sponsor_OriginalStyle_Web.png (4,433,647 bytes)
- about.html (6,812 bytes)
- banner.jpg (442,812 bytes)
- bronze-sponsor.png (2,584,342 bytes)
- contact.html (3,593 bytes)
- digital-camo.jpg (197,347 bytes)
- gallery.html (7,042 bytes)
- gold-sponsor.png (2,770,263 bytes)
- header-emblem.jpg (287,479 bytes)
- header-logo.png (2,020,105 bytes)
- hero-501.jpg (233,059 bytes)
- hero-screenshot-style.jpg (218,947 bytes)
- hero-team.jpg (276,875 bytes)
- hero.jpg (468,314 bytes)
- index.html (5,515 bytes)
- main.js (1,644 bytes)
- package.json (109 bytes)
- parents.html (7,760 bytes)
- platinum-sponsor.png (2,260,709 bytes)
- resources.html (7,548 bytes)
- seam-arc.png (5,478 bytes)
- seam-divider.png (9,210 bytes)
- shield-training.png (468,397 bytes)
- silver-sponsor.png (2,715,816 bytes)
- sponsor-bronze.jpg (364,350 bytes)
- sponsor-gold.jpg (365,822 bytes)
- sponsor-platinum.jpg (323,118 bytes)
- sponsor-silver.jpg (370,844 bytes)
- sponsor-title.jpg (695,380 bytes)
- sponsors.html (6,805 bytes)
- standard.html (20,694 bytes)
- style.css (138,609 bytes)
- teams.html (18,510 bytes)
- title-sponsor.png (4,582,523 bytes)
- wrangler.jsonc (268 bytes)
