# Contributing to Open HMI Network

Open HMI Network is a discovery and project-connection layer. Your repository stays yours. The registry stores metadata and links so useful HMI work can be discovered without transferring ownership of the underlying code or IP.

## Easiest path: submit from the website

1. Open `contribute.html` on the live site.
2. Add your GitHub repository and a short HMI description.
3. Choose the publication model: Open Source, Open Reference, or Partner Solution.
4. Click **Prepare Registry Entry** and review the generated JSON.
5. Click **Submit via GitHub** to create a review issue.

A maintainer reviews ownership, license/access model, and whether the work is useful to the HMI community before adding it to the registry.

## Advanced path: Pull Request

1. Copy `data/registry/schema/contributor-template.json` to `data/registry/contributors/<id>.json` if you do not already have a contributor profile.
2. Copy `data/registry/schema/contribution-template.json` to `data/registry/contributions/<id>.json`.
3. Add both paths to `data/registry/index.json` as needed.
4. Open a Pull Request.

The registry validation workflow checks JSON syntax, required fields and referenced files.

## Publication models

- **Open Source** — repository code is public under a clear license.
- **Open Reference** — architecture, demo or guidance is public while commercial source can remain controlled.
- **Partner Solution** — capability is visible; full source/customization is provided through a commercial engagement.

## Contributor opportunity model

Where applicable, contributor attribution stays visible. Contributors can opt into relevant project routing, paid engineering opportunities, and sponsored ecosystem work. Publication does not guarantee project allocation or payment.

## Ownership

Submitting metadata to the Open HMI registry does not transfer ownership of the linked repository, code, documentation, trademarks, or other IP. Contributors must have the right to share the material and must accurately describe any license or vendor/project restrictions.
