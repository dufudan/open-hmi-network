# Open HMI Network V0.2 — Architecture Funnel

This release integrates the former HMI product selector concept into Open HMI Network as an architecture-first funnel.

## Main changes

- New `selector.html`: 5-step HMI Architecture Selector.
- New `assets/js/selector.js`: architecture scoring and result generation.
- Updated `index.html`: homepage pathway is now Find → Evaluate → Build → Scale.
- Updated `assets/js/main.js`: selector results are carried into Hardware Application and Submit Project via URL parameters.
- Updated forms: selector context is displayed and included in the generated inquiry email.
- No chip or panel is recommended inside the selector. Specific hardware selection starts in Evaluate.

## Architecture directions

1. Smart Display / Serial HMI
2. Compact RTOS HMI
3. Performance RTOS HMI
4. Embedded Linux HMI
5. Edge / Vision HMI

## Deploy to the existing GitHub Pages repository

Upload/replace these files while preserving paths:

- `index.html`
- `selector.html`
- `hardware-application.html`
- `submit-project.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/js/selector.js`

Commit to `main`. GitHub Pages will redeploy automatically.

## Test flow

1. Open `/selector.html`.
2. Complete all 5 steps.
3. Confirm the result recommends an architecture direction rather than a chip.
4. Click `Request Evaluation Hardware` and verify the application form is prefilled.
5. Return to the result and click `Discuss This Architecture`; verify the project form carries the selector brief.
6. Submit both forms and confirm the generated email includes the selector context.
