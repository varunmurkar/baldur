# Baldur TODO

## TODO: Make snackbar stack Turbo-friendly (doesn't mimir already handle them correctly?)

Problem:
- `ui_snackbar_stack` renders a working stack, but there is no first-class Baldur helper/pattern for updating it from Turbo Stream responses.
- Apps currently need local wrappers like `#snackbar-stack-shell` plus manual `turbo_stream.update`.

Requested upstream improvements:
- Allow `ui_snackbar_stack` to accept standard HTML options:
  - `id:`
  - `class_name:`
  - `data:`
- Add a small helper for Turbo Stream snackbar updates, e.g.:
  - `ui_snackbar_turbo_stream(flash)`
  - or documented pattern using `turbo_stream.update`

Proposed API:
```ruby
ui_snackbar_stack(snackbars: snackbar_flash_payloads(flash), id: "snackbar-stack")
Nice-to-have:
- helper:
turbo_stream.update(
  "snackbar-stack",
  html: ui_snackbar_stack(snackbars: snackbar_flash_payloads(flash))
)
```
Why:
- enables native Turbo form flows with in-place validation success messages
- avoids app-level wrapper divs and custom partials just to refresh snackbars
- fits Hotwire/Turbo Rails usage patterns

## Install and Verification
- [ ] Harden `baldur:install` so host assumptions are reduced
- [ ] Audit generated controller shims against all shipped components
- [ ] Expand `script/verify_host_install` coverage
- [ ] Add end-to-end install verification in dummy app

## Showcase App and Docs
- [ ] Add agent-friendly docs, fetchable by Context7
- [ ] Add a dedicated dummy app in the extracted gem repo for visual smoke checks
- [ ] Add a component inventory/showcase page in that dummy app
- [ ] Add interaction showcase pages for modal, sidebar, menu select, snackbar, and `panel_secondary`
- [ ] Add copy-paste examples for core surfaces from the showcase app back into docs

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

## Internationalization
- [ ] Add I18n-friendly labels/messages for reusable helpers
- [ ] Remove hard-coded helper copy where practical
- [ ] Document translation override points

## Contributor and Agent Guidance
- [ ] Add `.agents/AGENTS.md` with project conventions and reference files for LLM agents
- [ ] Keep `.agents/AGENTS.md` in sync with actual project conventions
