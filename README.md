# OpenHMI V1 prototype

## Crawl foundations and deployment

Public pages use canonical URLs in navigation, sitemap and JSON-LD. Run
`python scripts/render_discovery.py` after changing resource or contributor data,
then commit the generated directory HTML. SEO validation runs in CI.

`canonical-navigation.js` redirects browser visits to `/index.html` to `/`,
preserving query parameters and fragments. GitHub Pages still returns HTTP 200
for both paths; this is a browser redirect, not an HTTP 301. A permanent HTTP
redirect requires a hosting or edge configuration that supports it.

Before notifying IndexNow, the workflow compares every sitemap page, canonical
alias and crawl-control file against the checked-out revision on the public
site. Stale or failed deployments stop the notification. Full commit history
is fetched so changed-page detection also handles pushes containing multiple
commits. The public IndexNow key remains a separate check.

Open `index.html` in a browser. No installation or build step is required.

- Homepage: concise project intake with descriptions and sharing links, one-click Engineering Path, three starting points, SoM production options, process, concept demos and engineering capabilities.
- Engineering Path: project materials, product requirements, current architecture assumptions, per-field Open / Preferred / Mandatory choices, optional advanced fields and production optimization permission.
- Both pages: responsive layout, keyboard navigation, removable links, link validation and project-brief review. Local files are not accepted; visitors can share them later by replying to the follow-up email.

The new homepage and Engineering Path send project briefs through Web3Forms using the same public form access key as the supplied old site. The visitor reviews their brief, provides a required reply email, then explicitly sends the request. Only an HTTP success with API `success: true` displays confirmation. Failure or timeout retains the details; repeated acceptance of the same brief in the current page session is suppressed. No AI analysis is performed. Reloading or leaving these pages clears unsaved input. Homepage concept demos are illustrative interfaces, not claimed customer work.

`intake-config.js` configures delivery; `intake-submit.js` formats a readable email and submits descriptions, engineering details and sharing links as JSON through Web3Forms. Both pages use Add a link instead of a file picker. Links appear in the review and email; no attachment bytes are transmitted. Rejected requests display an error and retain the brief and links. Actual inbox delivery has not been verified. The access key determines the recipient according to the existing Web3Forms account; the website does not reassign the mailbox.

Delivery validation: isolated tests cover the JSON email payload, readable constraints and sharing links, distinct engineering subject, API rejection, HTTP/network/response failures, rejection of unsupported attachments and custom backend compatibility. Browser checks cover link validation, required email, retained details after simulated rejection, successful retry and duplicate prevention. No real email was sent during these tests.

## Navigation update

The confirmed navigation is Solutions · Engineering · Production · Demos · Resources · Get started. The original logo remains unchanged. On mobile, Engineering stays visible beside a collapsible Menu; Escape closes the menu.

- Solutions opens a concise application hub linked to the supplied application pages and robot demo.
- Engineering opens Engineering Path directly.
- Production opens a new page titled Prototype to Production, covering architecture, optimization and validation.
- Demos opens the supplied `projects.html` with its original videos, detail pages and contributor attribution.
- Resources opens Guides, SDK & Developer Resources, Engineering Tools and Contributors. Memory Checklist remains at `tools/embedded-memory-checklist/index.html` and is linked from Engineering Tools.

The supplied site's public pages and assets are included, with a consistent header. Existing technical data and inquiry mechanisms are retained: some legacy forms still use Web3Forms or open an email application. No legacy form was submitted or delivery verified during this update. Memory Checklist's return-to-project workflow and Engineering Path contextual link remain planned for the next integration step; Hardware now links to the checklist.

## Unified visual system

48 content pages now share `site-theme.css`, the original logo and a common footer with Project, Engineering and Resources links. Four historical redirect pages retain their redirects. The footer includes Contributor Access and the existing LinkedIn profile link.

The original content pages use the homepage's Arial typography, restrained blue, white background, smaller card corners and simpler buttons. Hardware copy is shortened with optional architecture guidance; Demos keeps all five real videos and author attribution; Modules keeps its models, technical values and accurate statuses, with selection/status explanations collapsed by default. Resource catalogues, contributor profiles, articles and engineering tools use the same visual foundation while retaining their layouts and information density. Dark review panels remain where they distinguish results from editable inputs.

Visual checks covered desktop Hardware, Modules, Demos, the developer resource catalogue and Memory Checklist, plus narrow mobile layouts. Resource search, vendor filtering, contributor profile links and module status disclosure were checked. All local HTML/assets and fragment links resolve. Existing Web3Forms delivery logic is unchanged by the visual update.

Use the local HTTP preview to access the original data-driven resources and contributor pages. Opening them directly as local files may prevent data loading.

## Future intake integration

Before loading `app.js`, configure:

```html
<script>
window.OPENHMI_CONFIG = {
  intakeEndpoint: '/api/intake',
  engineeringEndpoint: '/api/engineering-review'
};
</script>
```

Explicit custom endpoints override Web3Forms for the respective page. Both submission actions then post multipart form data with `brief` as a JSON string (including `contact.email` and sharing links). No files are included. Only a successful HTTP response displays a received confirmation. Without a custom endpoint, both pages use the existing Web3Forms configuration.

Brief schema: version, source, creation time, description, project stage, product requirements, architecture assumptions, architecture notes, specifications, optimization permission and links. The reserved `attachments` array is empty. Every populated architecture/specification field includes `constraintLevel`. Empty fields are omitted; unknown values are not invented. Mandatory choices must remain fixed even when production optimization is allowed. Apply this rule server-side before any AI architecture recommendations.

If adding a custom backend, implement validation, file storage and request tracking at the configured endpoints. Keep private credentials and future AI calls on the server. The existing Web3Forms route does not require this backend.

## Optional local preview

Run from this folder:

```text
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`.

## Brand identity

The header and footer preserve the original openhmi.network wordmark and four-color dot mark. `brand.css` preserves the original geometry and colors from the live site CSS; `favicon.svg` is the unchanged original site asset. New page typography remains separate from the brand styling. Source: https://openhmi.network/index.html and https://openhmi.network/assets/css/styles.css?v=080.
