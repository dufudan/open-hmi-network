# OpenHMI Network V0.3

V0.3 adds a multi-vendor developer-resource and contributor ecosystem on top of the V0.2 lead-generation funnel.

## New pages
- `resources.html` — multi-vendor developer resource hub
- `contribute.html` — contributor value and contribution flow
- `software.html` — revised Build landing page linking resources + engineering

## Resource model
Resource data lives under `data/resources/` and is loaded by `assets/js/resources.js`.

Each resource supports:
- vendor
- category
- type
- source (`official`, `open-hmi`, `community`)
- access (`open-source`, `public`, `registration`, `request`, `restricted`)
- architecture
- url
- description

`data/vendors/index.json` lists active vendor workspaces. Add a vendor by creating a new resource JSON file and adding the vendor metadata to that index.

## First vendor workspace
ArtInChip is the first structured vendor workspace. Its links were structured from the official resource collection supplied for this project. OpenHMI Network links to official sources and does not override vendor ownership, license or access policy.

## Contributor model
The site now communicates four contributor returns:
1. Attribution
2. Project priority
3. Paid engineering opportunities
4. Sponsored development / bounty opportunities

Contribution can use three publication models:
- Open Source
- Open Reference
- Partner Solution

No contribution is published automatically; rights and access should be reviewed first.
