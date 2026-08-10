# OpenHMI Network — Static V0.1

A zero-monthly-cost static rebuild of the Framer prototype.

## Files
- `index.html` — main landing page
- `hardware-application.html` — project hardware qualification form
- `submit-project.html` — general HMI project brief
- `projects.html` — project concepts / future reference projects
- `software.html` — software resources placeholder
- `hardware.html` — evaluation hardware placeholder
- `partners.html` — engineering partner capability page
- `assets/css/styles.css` — shared design system and responsive breakpoints
- `assets/js/main.js` — mobile nav + email-form fallback

## Important: forms
The V0.1 forms currently use JavaScript to open the visitor's email client and prepare a structured message to:
- `hardware@openhmi.network`
- `project@openhmi.network`

Before public launch, make sure these addresses exist or forward to a monitored inbox.

For more reliable web-native form submission, replace the fallback with Tally, Formspree, Web3Forms, Google Forms, or another endpoint. The page structure can remain unchanged.

## Free hosting option A — GitHub Pages
1. Create a public repository, e.g. `open-hmi-network`.
2. Upload the contents of this folder (not the outer ZIP).
3. In GitHub: Settings → Pages → Deploy from a branch → `main` / root.
4. Test the generated `github.io` URL.
5. Only after testing, configure the custom domain `openhmi.network` in GitHub Pages and replace the current Porkbun forwarding with the DNS records GitHub provides.

## Free hosting option B — Cloudflare Pages
Connect the GitHub repository to Cloudflare Pages. Build command is blank; output directory is `/` for this pure static site.

## Recommended V0.1 launch order
1. Replace placeholder project media with real demo photos/screenshots.
2. Configure `hardware@openhmi.network` and `project@openhmi.network` forwarding or mailbox.
3. Test both forms on desktop and mobile.
4. Publish first to a free host URL.
5. Ask 3–5 existing engineering partners to test it.
6. Move `openhmi.network` from temporary forwarding to the static host only after the test passes.

## Content note
The three homepage projects are labeled as **Reference Application Concepts** so visitors do not mistake them for completed customer case studies. Convert them to **Featured HMI Projects** only when verified demos/case studies are available.

## V0.3
Adds a multi-vendor Developer Resources hub and contributor ecosystem. See `README-V0.3.md` for the data model, vendor-workspace structure and contributor model.

## V0.3.1
Adds the GitHub-backed contributor registry, contributor directory/profile pages, contribution metadata generator, GitHub review flow and registry validation. See `README-V0.3.1.md`.

## V0.4.5
Adds multi-search-engine indexing support with IndexNow automation plus Bing, Yandex and Baidu setup guidance. See `README-V0.4.5.md` and `MULTI-SEARCH-ENGINE-SETUP.md`.
