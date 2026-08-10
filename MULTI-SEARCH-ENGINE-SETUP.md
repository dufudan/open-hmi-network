# OpenHMI Network — Multi-Search Engine Setup

V0.4.5 adds site-side preparation for Google, Bing, IndexNow-enabled engines, Yandex and Baidu.

## Already handled by the repository

- `robots.txt` allows crawling and points to `https://openhmi.network/sitemap.xml`.
- `sitemap.xml` remains the canonical list of indexable pages.
- Canonical URLs, page titles, descriptions, favicon assets and structured data remain in place from V0.4.4.
- A root IndexNow ownership key file is included.
- `.github/workflows/indexnow.yml` automatically submits changed indexable HTML pages to the IndexNow global endpoint after pushes to `main`.
- `scripts/indexnow_submit.py` uses `sitemap.xml` as an allowlist, so utility/noindex pages are not submitted accidentally.
- The IndexNow workflow can also be run manually to submit every URL in the sitemap once after installation.

## 1. Bing Webmaster Tools

Recommended first because OpenHMI already has Google Search Console configured.

1. Sign in to Bing Webmaster Tools.
2. Choose the option to import sites from Google Search Console when available.
3. Confirm `https://openhmi.network/` is present.
4. Confirm the sitemap is `https://openhmi.network/sitemap.xml`.
5. After V0.4.5 is deployed, open Bing Webmaster Tools → IndexNow and confirm submitted URLs begin appearing.

Do not add a separate Bing URL Submission API integration unless there is a specific need. IndexNow is the repository's real-time notification path.

## 2. IndexNow

The repository includes an ownership key at the domain root. Keep the file in place while IndexNow is enabled.

After the first V0.4.5 deployment:

1. Open GitHub → Actions → **Notify IndexNow**.
2. Run workflow manually once.
3. Leave **Submit all URLs currently listed in sitemap.xml** enabled.
4. Future pushes to `main` will automatically notify IndexNow only for changed, indexable pages.

The script sends to the global endpoint `https://api.indexnow.org/indexnow`. One accepted submission can be shared across participating IndexNow search engines.

IndexNow notifies search engines that a URL changed; it does not guarantee crawling, indexing or ranking.

## 3. Yandex Webmaster

1. Add `https://openhmi.network/` to Yandex Webmaster.
2. Use the verification method Yandex currently provides and keep the verification record/file in place.
3. Add `https://openhmi.network/sitemap.xml` in the Sitemap section.
4. IndexNow is already handled by the OpenHMI GitHub workflow; no second Yandex-specific IndexNow integration is needed.

## 4. Baidu Search Resource Platform

Baidu requires its own site verification and submission workflow; do not invent a verification token in the repository.

1. Add `https://openhmi.network/` in Baidu Search Resource Platform.
2. Choose file verification or HTML-tag verification and obtain the actual token/file from Baidu.
3. Add that real verification value to the site and keep it in place.
4. Submit `https://openhmi.network/sitemap.xml` / important URLs using the submission options available in the verified account.

When Baidu gives a verification file or `<meta>` value, add exactly that value. Do not use a placeholder verification token on the production site.

## 5. Optional regional engines

IndexNow currently reaches multiple participating engines. OpenHMI does not need a separate integration for every participant unless a regional market becomes strategically important and the engine offers useful webmaster analytics.

## What to monitor

Keep separate performance baselines rather than comparing raw ranking positions across engines:

- indexed pages
- crawl/indexing errors
- search queries
- impressions
- clicks
- CTR
- landing pages that generate qualified project or contributor traffic

For OpenHMI, prioritize high-intent HMI queries and qualified visits over ranking for the ambiguous single word `openhmi`.
