# OpenHMI v0.8.1 Repair Patch

## Repair target

Restore the public site to **OpenHMI V0.8 P0** and then add only these three HMI modules:

- TCW40 / Allwinner A40i
- TCW-507M / Allwinner T507
- TC3568M / Rockchip RK3568

The V0.8 P0 baseline is GitHub commit:

`9e23730118c16488cdc8541683137da41495d388`

Commit title:

`Deploy OpenHMI V0.8 P0 decision entry`

## Why the baseline restore is required

The later `upgrade to 0.9` commit did not only add pages. It replaced core V0.8 files including:

- `index.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `boundary-assessment.html`
- `hardware.html`
- `guides.html`
- `resources.html`
- `projects.html`
- `partners.html`
- `selector.html`
- `submit-project.html`
- `sitemap.xml`
- `modules.html`

Therefore **do not repair the current main branch by uploading this overlay alone**.

## Recommended recovery sequence

### Step 1 — Restore V0.8 P0

In GitHub, restore `main` to commit:

`9e23730118c16488cdc8541683137da41495d388`

Preferred method: restore the complete commit/tree rather than manually copying individual files.

After this step the homepage should again show the V0.8 decision architecture:

- Building an Embedded HMI?
- Choose → Verify → Build → Deliver
- HMI Architecture Ladder
- HMI Boundary Assessment
- Verified HMI Stacks
- Problem Guides
- Migration & Rescue
- Capability Network

### Step 2 — Apply this repair overlay

Upload the contents of this ZIP to the repository root, keeping folders.

Files intentionally changed/added:

- `modules.html`
- `modules/tcw40-a40i-hmi-module.html`
- `modules/tcw-507m-t507-hmi-module.html`
- `modules/tc3568m-rk3568-hmi-module.html`
- `assets/docs/tcw40-a40i-module-manual-en.pdf`
- `assets/docs/tcw-507m-t507-module-manual-en.pdf`
- `assets/docs/tc3568m-rk3568-module-manual-en.pdf`

No homepage, CSS, JavaScript, Boundary Assessment, Hardware, Resources, Demos or Partner pages are changed by this overlay.

### Step 3 — GitHub Pages

Settings → Pages:

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

Wait for the Pages deployment to finish.

## Do not keep these V0.9-only files after the restore

If you restore by uploading files rather than resetting the full tree, remove the files listed in `REMOVE-V09-ONLY.txt`.
