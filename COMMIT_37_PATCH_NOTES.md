# Commit 37 — Gemstone UI System v1.0 Patch

Patch workflow: copy these files into the repo root and overwrite `style.css`.

Included changes:
- Adds `gem-button-sapphire.png` for secondary/informational CTAs.
- Adds payment gemstone assets:
  - `gem-button-paypal.png`
  - `gem-button-venmo.png`
  - `gem-button-emerald.png`
- Extends the existing Ruby implementation into a shared gemstone button system.
- Converts `.brand-btn.steel`, `.brand-btn.navy`, and `.brand-btn.secondary` to Sapphire.
- Converts PayPal donation buttons to the cobalt PayPal gemstone.
- Converts Venmo and Cash App support/payment links to gemstone treatments.
- Adds shared hover, active, and focus-visible behavior.

Deploy notes:
1. Drag these files into the repository root.
2. Overwrite `style.css`.
3. Commit and deploy through the existing GitHub + Cloudflare flow.
4. Verify homepage, Payments, Support, Parent Hub, and mobile menu pages.
