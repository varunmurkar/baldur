# Baldur TODO

## Install and Verification
- [ ] Harden `baldur:install` so host assumptions are reduced
- [ ] Audit generated controller shims against all shipped components
- [ ] Expand `script/verify_host_install` coverage
- [ ] Add end-to-end install verification in dummy app

## Showcase App and Docs
- [ ] Add a dedicated dummy app in the extracted gem repo for visual smoke checks
- [ ] Add a component inventory/showcase page in that dummy app
- [ ] Add interaction showcase pages for modal, sidebar, menu select, snackbar, and `panel_secondary`
- [ ] Add copy-paste examples for core surfaces from the showcase app back into docs
- [ ] Add a dummy-app example showing segmented tabs inside a form with hidden tab state

## Starter Templates
- [ ] Add dedicated password reset templates
- [ ] Add magic link templates
- [ ] Add error/system pages
- [ ] Add starter settings page layout
- [ ] Add starter CRUD index/show/form templates
- [ ] Add starter dashboard shell/page templates
- [ ] Add boilerplate page template with page title component

## Forms
- [ ] Add Rails form-builder integration for Baldur fields
- [ ] Bind labels, hints, errors, and invalid states automatically
- [ ] Document model-bound form usage

## Buttons
- [x] `ui_button` should support `formaction` and `formmethod` attributes so host apps can use it as a form-action button (e.g. Turbo-frame-aware submit that posts to a different endpoint)
  - Currently host apps fall back to raw `<button>` or `button_tag` because `ui_button` only forwards `type`, `data`, `aria`, `disabled`, and `form`.
  - Add passthrough for `formaction` and `formmethod` in both `ui_button` helper signature and `baldur/components/button` partial.
  - Accept `value:` and `name:` too so it can double as a named submit button.
  - Verify with a dummy-app example that submits within a Turbo Frame to a custom formaction.
  - Why: keeps host code free of custom HTML button wiring and lets `ui_button` act as a full submit/FAB replacement.
- [ ] Document interplay between `ui_button`, hidden state fields, and segmented tabs for multi-panel forms
  - avoid host apps inventing ad hoc flow-state patterns just to support review/commit loops

## Tabs and Segmented Controls
- [x] Add a first-class `ui_tabs` primitive or documented tabs pattern built on `ui_segmented_buttons`
  - selected tab trigger
  - tab panels
  - ARIA wiring
  - keyboard behavior
  - hidden / inactive panel handling
- [x] Provide a small Stimulus controller for segmented-button tabs so host apps do not hand-roll `show/hide` logic
- [x] Support syncing selected tab into a hidden input for form-backed workflows
- [x] Document when tabs should be:
  - instant client-side state
  - Turbo GET navigation
  - preserved across POST / redirect / render flows
- [ ] Consider adding a higher-level `ui_tabs` helper on top of the documented segmented-buttons pattern once host usage stabilizes

## Tables and Resource Screens
- [ ] Add a higher-level resource index pattern on top of existing table primitives
- [ ] Support search, filters, row actions, bulk select, and empty states
- [ ] Document recommended resource index composition
- [ ] Table accessibility: add <caption> or aria-label to admin tables

## Theming
- [ ] Add a small set of starter theme presets

## Accessibility
- [ ] Audit keyboard and focus behavior across interactive components
- [ ] ADA WCAG 2.1 AA compliance
- [ ] Add accessibility-focused tests for core surfaces
- [ ] Document a11y guarantees and known gaps

## Internationalization
- [ ] Add I18n-friendly labels/messages for reusable helpers
- [ ] Remove hard-coded helper copy where practical
- [ ] Document translation override points

## Contributor and Agent Guidance
- [ ] Add `.agents/AGENTS.md` with project conventions and reference files for LLM agents
- [ ] Keep `.agents/AGENTS.md` in sync with actual project conventions
