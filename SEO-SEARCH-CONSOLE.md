# OpenHMI Network — Google Search Console setup

## After uploading v0.3.4

1. Verify the **Domain property** `openhmi.network` in Google Search Console using the DNS TXT record supplied by Google.
2. In Search Console → **Sitemaps**, submit: `https://openhmi.network/sitemap.xml`
3. Use **URL Inspection** and request indexing for these first:
   - `https://openhmi.network/`
   - `https://openhmi.network/guides.html`
   - `https://openhmi.network/guides/serial-hmi-vs-chip-level.html`
   - `https://openhmi.network/guides/mcu-mpu-soc-for-hmi.html`
   - `https://openhmi.network/guides/choosing-embedded-gui-tool.html`
   - `https://openhmi.network/guides/chip-to-production-hmi.html`
4. Keep the Google verification TXT record in Porkbun DNS after verification.
5. Monitor **Page indexing** and **Performance** in Search Console.

## What v0.3.4 adds

- `/sitemap.xml`
- `/robots.txt`
- unique SEO titles and meta descriptions on key pages
- self-referencing canonical URLs (important because UTM-tagged links create URL variants)
- Open Graph and Twitter metadata
- Organization + WebSite structured data on the home page
- Article + Breadcrumb structured data on the four OpenHMI Guides
- `noindex,follow` on utility form/profile-shell pages that are not useful search landing pages

## Important

Search Console verification is performed through DNS. Do not paste the `google-site-verification` TXT value into this repository.
