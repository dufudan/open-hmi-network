# Open HMI Network V0.3.1

V0.3.1 turns the contributor concept into a working static GitHub-based registry.

## New pages
- `contributors.html` — contributor directory
- `contributor.html?id=<contributor-id>` — contributor profile generated from registry JSON
- `contribute.html` — GitHub contribution submission and registry JSON preview

## Registry
Contributor metadata lives under `data/registry/`.

- `data/registry/index.json` — registry index
- `data/registry/contributors/` — one JSON file per contributor
- `data/registry/contributions/` — one JSON file per contribution
- `data/registry/schema/` — templates for new entries

This is intentionally an index, not a source-code mirror. The contributor keeps the original repository and IP.

## Contribution workflow
1. Contributor keeps the demo / guide / integration in their own GitHub repository.
2. The Open HMI contribution form generates a registry proposal.
3. `Submit via GitHub` opens a review issue in `dufudan/open-hmi-network`.
4. A maintainer checks ownership, license and publication model.
5. Accepted metadata is added to `data/registry/`.
6. The contribution appears in the contributor profile and community registry area.
7. If the contributor opts in, relevant project inquiries can link back to the contributor.

## Publication models
- `open-source` — code is open under a clear license.
- `open-reference` — demo / architecture / guidance is public while commercial source can remain controlled.
- `partner-solution` — capability is visible; source and customization are handled commercially.

## GitHub support
- `CONTRIBUTING.md` documents issue and Pull Request flows.
- `.github/ISSUE_TEMPLATE/contribution.md` provides a standard contribution issue.
- `.github/workflows/validate-registry.yml` validates registry changes.
- `scripts/validate_registry.py` checks JSON references, required fields and allowed values.

## Seed data
The three current Open HMI demo cases are registered under the `open-hmi-network` contributor profile so the workflow has a live example from day one.
