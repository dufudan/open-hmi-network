# OpenHMI Network V0.4.5 — Multi-Search Engine Ready

This release extends the SEO foundation beyond Google without duplicating search-engine-specific markup across the public website.

## Changes

- Adds IndexNow ownership verification at the site root.
- Adds a dependency-free IndexNow submission script.
- Adds a GitHub Actions workflow that notifies IndexNow when indexable OpenHMI pages change on `main`.
- Adds a manual workflow option to submit all current sitemap URLs once after rollout.
- Uses `sitemap.xml` as the allowlist so noindex form/profile shells are not pushed accidentally.
- Keeps the existing standards-based `robots.txt`, canonical URLs, sitemap, structured data, search titles and favicon setup compatible with multiple crawlers.
- Adds `MULTI-SEARCH-ENGINE-SETUP.md` for Bing Webmaster Tools, Yandex Webmaster and Baidu Search Resource Platform onboarding.

## Deployment

Upload the V0.4.5 files to the repository root and commit to `main`.

After GitHub Pages deploys:

1. Confirm the new root IndexNow `.txt` key file loads publicly.
2. In GitHub Actions, manually run **Notify IndexNow** once with **submit all** enabled.
3. Add/import the site in Bing Webmaster Tools and confirm the sitemap.
4. Add the site in Yandex Webmaster and submit the same sitemap.
5. If Baidu is a target, obtain Baidu's real verification token/file first, then add it in a follow-up commit.

See `MULTI-SEARCH-ENGINE-SETUP.md` for the full checklist.
