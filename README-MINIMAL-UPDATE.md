# OpenHMI v0.8 + 3 New HMI Modules

This is a **minimal overlay package** for the existing OpenHMI v0.8 website.

## What changes
Only the HMI Modules area is changed:

- `modules.html` — adds three new module cards.
- `modules/tcw40-a40i-hmi-module.html`
- `modules/tcw-507m-t507-hmi-module.html`
- `modules/tc3568m-rk3568-hmi-module.html`
- `assets/docs/` — adds the three supplied English technical reference manuals.

## What does NOT change
The following v0.8 architecture is intentionally untouched:

- Homepage
- Navigation structure
- HMI Architecture Ladder
- Boundary Assessment
- Verified HMI Stacks
- Hardware page
- Guides / Resources
- Projects / Demos
- Partners / Contributors
- Existing A733 and UNISOC module pages
- CSS and JavaScript

## Installation
Copy the contents of this package over the v0.8 site root.

No existing file should be removed.

## Module positioning
- TCW40 / Allwinner A40i — Cost-focused Linux HMI
- TCW-507M / Allwinner T507 — Mainstream Embedded Linux HMI
- TC3568M / Rockchip RK3568 — Advanced Linux / Android HMI

Specifications shown on the new pages are based only on the supplied technical reference manuals. Values marked “typically” or “documented up to” remain configuration-dependent and should be confirmed before design-in.
