# openhmi.network Registry

The registry is an index, not a code mirror. Contributors keep their repositories and IP. The network stores only the metadata needed to make useful HMI work discoverable and connect it to relevant projects.

## Add a contributor
1. Copy `schema/contributor-template.json` to `contributors/<id>.json`.
2. Keep `id` stable and URL-safe.
3. Add the new file path to `index.json`.

## Add a contribution
1. Copy `schema/contribution-template.json` to `contributions/<id>.json`.
2. Use `repository_url` for the contributor-owned GitHub repository.
3. Choose a publication model: `open-source`, `open-reference`, or `partner-solution`.
4. Add the new file path to `index.json`.

## Publication models
- `open-source`: code is public under a clear license.
- `open-reference`: architecture, demo or guidance is public while commercial source may remain controlled.
- `partner-solution`: capability is visible; source/customization is a commercial engagement.

Nothing in the registry changes the ownership or license of the linked repository.
