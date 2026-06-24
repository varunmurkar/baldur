# Baldur TODO

## Install and Verification
- [ ] Harden `baldur:install` so host assumptions are reduced
- [ ] Audit generated controller shims against all shipped components
- [ ] Expand `script/verify_host_install` coverage
- [ ] Add end-to-end install verification in dummy app

## Showcase App and Docs
- [x] Add agent-friendly docs, fetchable by Context7
- [ ] Add a dedicated dummy app in the extracted gem repo for visual smoke checks
- [ ] Add a component inventory/showcase page in that dummy app
- [ ] Add interaction showcase pages for modal, sidebar, menu select, snackbar, and `panel_secondary`
- [ ] Add copy-paste examples for core surfaces from the showcase app back into docs
- [x] Document `ui_segmented_buttons` as a tabs primitive, not just a visual button group
- [x] Add cookbook examples for segmented tabs covering:
  - local instant switching
  - server-driven / Turbo-backed tab selection
  - preserving selected tab across form submits
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
- [x] Add `ui_hidden_field_tag` helper (or document `hidden_field_tag` as the canonical Baldur-free hidden field primitive)
- [ ] Consider adding `step:` and other HTML5 input attributes to `ui_text_field_tag` public signature, or document passing them through `input_options`
- [ ] Add first-class guidance for hidden state fields used with interactive Baldur controls
  - examples: active tab, filters, stepped form state, selected panel
  - clarify when plain `hidden_field_tag` is acceptable vs when Baldur should wrap it
- [ ] Document the recommended pattern for submit buttons that intentionally switch UI context before submit
  - example: a review button that moves the user into a Targets tab before rendering results

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
- [ ] Add a first-class `ui_tabs` primitive or documented tabs pattern built on `ui_segmented_buttons`
  - selected tab trigger
  - tab panels
  - ARIA wiring
  - keyboard behavior
  - hidden / inactive panel handling
- [ ] Provide a small Stimulus controller for segmented-button tabs so host apps do not hand-roll `show/hide` logic
- [ ] Support syncing selected tab into a hidden input for form-backed workflows
- [ ] Document when tabs should be:
  - instant client-side state
  - Turbo GET navigation
  - preserved across POST / redirect / render flows

## Tables and Resource Screens
- [ ] Numeric cols should be right-aligned by default 
- [ ] Consider `pagy` gem for tables component
- [ ] Add a higher-level resource index pattern on top of existing table primitives
- [ ] Support search, filters, row actions, bulk select, and empty states
- [ ] Document recommended resource index composition
- [ ] Table accessibility: add <caption> or aria-label to admin tables

## Theming
- [ ] Add a small set of starter theme presets
- [ ] Add first-class `ui_theme_toggle` helper/component so hosts do not need to copy Mimir toggle partial
- [ ] Improve dark-mode/theme controller documentation
  - [ ] Theme toggle on auth page templates need top rail 
  - [ ] Document brand-token customization more clearly

## Accessibility
- [ ] Audit keyboard and focus behavior across interactive components
- [ ] ADA WCAG 2.1 AA compliance
- [ ] Add accessibility-focused tests for core surfaces
- [ ] Document a11y guarantees and known gaps
- [ ] Audit `ui_segmented_buttons` for tab semantics when used as tabs
  - `role="tablist"`
  - `role="tab"`
  - `aria-selected`
  - `tabindex`
  - panel association guidance
- [ ] Document that segmented buttons alone are not a complete tabs solution without panel semantics

## Internationalization
- [ ] Add I18n-friendly labels/messages for reusable helpers
- [ ] Remove hard-coded helper copy where practical
- [ ] Document translation override points

## Contributor and Agent Guidance
- [ ] Add `.agents/AGENTS.md` with project conventions and reference files for LLM agents
- [ ] Keep `.agents/AGENTS.md` in sync with actual project conventions
