# OpenHMI Network — UTM Tracking Standard

Version: 0.3.2.4

## Purpose

Use one consistent tagging convention for links shared through LinkedIn, email, GitHub and partner outreach. OpenHMI Network stores the latest tagged campaign locally for up to 30 days and adds the attribution fields to Hardware / Project inquiry emails.

Cloudflare Web Analytics remains the privacy-first page-traffic layer. It can show page paths, referrers, countries and devices, but it does not currently report UTM query parameters as campaign dimensions. The UTM layer therefore gives OpenHMI Network lead-level attribution without changing the public site architecture.

## Naming rules

- lowercase only
- use snake_case
- no spaces
- keep campaign names stable for a quarter or a clear initiative
- use `utm_content` to distinguish the creative/link placement
- do not put a person's email, phone number or other personal data in UTM values

## Standard fields

| Field | Meaning | Recommended values |
|---|---|---|
| `utm_source` | traffic source | `linkedin`, `email`, `github`, `partner`, `qr` |
| `utm_medium` | placement/channel | `post`, `comment`, `dm`, `profile`, `article`, `outreach`, `referral`, `qr` |
| `utm_campaign` | business initiative | `openhmi_launch_2026q3`, `guide_distribution_2026q3`, `partner_outreach_2026q3`, `community_2026q3` |
| `utm_content` | exact asset / placement | `serial_hmi_poster`, `gui_tool_guide`, `2w_cluster_demo`, `contributor_invite` |
| `utm_term` | optional segment / keyword | `industrial_hmi`, `lvgl`, `linux_hmi` |

## Ready-to-use examples

### LinkedIn poster comment

https://openhmi.network/?utm_source=linkedin&utm_medium=comment&utm_campaign=openhmi_launch_2026q3&utm_content=serial_hmi_poster

### LinkedIn post

https://openhmi.network/guides.html?utm_source=linkedin&utm_medium=post&utm_campaign=guide_distribution_2026q3&utm_content=open_hmi_guides

### LinkedIn partner DM

https://openhmi.network/contribute.html?utm_source=linkedin&utm_medium=dm&utm_campaign=partner_outreach_2026q3&utm_content=contributor_invite

### LinkedIn profile / Featured

https://openhmi.network/?utm_source=linkedin&utm_medium=profile&utm_campaign=always_on&utm_content=featured_website

### Email outreach

https://openhmi.network/?utm_source=email&utm_medium=outreach&utm_campaign=partner_outreach_2026q3&utm_content=website_intro

### GitHub / community referral

https://openhmi.network/resources.html?utm_source=github&utm_medium=referral&utm_campaign=community_2026q3&utm_content=resource_registry

## Lead attribution in inquiry email

If a visitor arrives through a tagged link and later submits a Hardware or Project inquiry, the generated email includes:

- UTM Source
- UTM Medium
- UTM Campaign
- UTM Content
- UTM Term
- Landing Page
- Original Referrer

This attribution is stored locally in the browser for up to 30 days. A new tagged visit replaces the previous campaign attribution.

## Recommended review rhythm

Weekly: traffic source / top pages in Cloudflare Web Analytics.
Monthly: count qualified inquiry emails by UTM Source, Medium, Campaign and Content.
Quarterly: keep the high-performing campaigns and retire unused naming variants.
