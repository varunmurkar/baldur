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

## Starter Templates
- [ ] Add dedicated password reset templates
- [ ] Add magic link templates
- [ ] Add error/system pages
- [ ] Add starter settings page layout
- [ ] Add starter CRUD index/show/form templates
- [ ] Add starter dashboard shell/page templates

## Forms
- [ ] Add Rails form-builder integration for Baldur fields
- [ ] Bind labels, hints, errors, and invalid states automatically
- [ ] Document model-bound form usage

## Tables and Resource Screens
- [ ] Add a higher-level resource index pattern on top of existing table primitives
- [ ] Support search, filters, row actions, bulk select, and empty states
- [ ] Document recommended resource index composition

## Theming
- [ ] Add a small set of starter theme presets
- [ ] Improve dark-mode/theme controller documentation
- [ ] Document brand-token customization more clearly

## Accessibility
- [ ] Audit keyboard and focus behavior across interactive components
- [ ] Add accessibility-focused tests for core surfaces
- [ ] Document a11y guarantees and known gaps

## Internationalization
- [ ] Add I18n-friendly labels/messages for reusable helpers
- [ ] Remove hard-coded helper copy where practical
- [ ] Document translation override points
