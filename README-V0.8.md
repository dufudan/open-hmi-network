# openhmi.network V0.8 — HMI Decision & Delivery Entry

This release moves the homepage from resource presentation toward a buyer-facing HMI decision and delivery path.

## Core path

**Choose → Verify → Build → Deliver**

## P0 implementation

- New buyer-facing Hero: **Building an Embedded HMI?**
- Primary actions: **Assess My HMI** and **Explore Verified Stacks**.
- New four-tier HMI Architecture Ladder with a sweet spot and boundary signals for every tier.
- Neutral architecture principle: stay with the simplest tier that has healthy headroom.
- New rule-based `boundary-assessment.html` covering Display, UI, Performance, System and Product inputs.
- Assessment output covers Current Architecture, Boundary Status, Display, Memory, Rendering, Connectivity and Boot-Lifecycle risks.
- Assessment supports three outcomes: Comfortable, Near boundary and Boundary crossed.
- Comfortable and watch outcomes can explicitly recommend **Stay with current architecture**.
- Results connect to Learn, Compare and Validate actions.
- Homepage order now follows Architecture Ladder → Boundary → Verified Stacks → Problems → Migration & Rescue → Capability Network.

## Verification language

“Verified” is scoped. Existing examples use `Demo-validated` or `Reference available`; product-level thermal, EMC, safety, lifecycle and production validation are not implied.

## Files added

- `boundary-assessment.html`
- `assets/js/boundary-assessment.js`
- `README-V0.8.md`

## Files updated

- `index.html`
- `assets/css/styles.css`
- `sitemap.xml`

## Next phases

See `OpenHMI-Website-Update-Task-Checklist.md` in the task deliverables for the P1 and P2 backlog.
