# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Lowered minimum Rails dependency from `>= 8.1.0` to `>= 7.0`.
- Lowered minimum `tailwindcss-rails` dependency from `>= 4.4.0` to `>= 4.3.0`.

### Fixed

- `ui_auth_page` now includes explicit Tailwind padding, centering, and responsive container width so auth pages no longer go full-bleed on narrow viewports or when CSS custom properties resolve late.

### Added

- Agent-friendly doc entrypoints: `llms.txt`, `llms-full.txt`, and `context7.json` for Context7 and similar doc-ingestion tools.
- `ui_snackbar_stack` now accepts `id:`, `class_name:`, and `data:` so the stack can be targeted by Turbo Streams.
- `ui_snackbar_turbo_stream(flash, target: "snackbar-stack")` helper for opt-in Turbo Stream snackbar updates. Raises a clear `ArgumentError` if `turbo-rails` is not available in the host app.
- `docs/alerts-and-snackbars.md` now includes Turbo Stream layout and usage examples.
- New task-based `docs/` directory with focused usage guides.
- Public roadmap in `README.md` grouped by initiative.

## [0.2.5]

### Added

- `snackbar_flash_payloads(flash)` helper — normalizes Rails flash messages into snackbar payloads for `ui_snackbar_stack`. Maps `flash[:success]` → `:success`, `flash[:notice]` → `:notice`, `flash[:alert]` → `:error`, `flash[:warning]` → `:warning`. Supports string and hash payloads (hash allows custom `title:`, `icon:`, etc.).
- `test/snackbar_flash_helper_test.rb` — coverage for string, hash, blank, and multi-key flash payloads.

## [0.2.4]

### Fixed

- Confirmation modal typed-confirm input now uses shared `ui_text_field_tag` component instead of hand-built markup. Input inherits `.field .text-field` wrapper, CSS variables, and focus styles for free.
- Removed dead `[data-confirmation]` CSS selector in `confirmation.css` that never matched modal markup. Focus styling now comes from shared `forms.css` via `.text-field__input:focus-within`.
- `test/confirmation_modal_helper_test.rb` — added assertions for `.field.text-field` wrapper and `field__label` class in typed-confirm mode.

## [0.2.3]

### Fixed

- Engine Tailwind `@source` paths now resolve correctly from `app/assets/tailwind/baldur/` to `app/helpers` and `app/views`. Previously pointed to nonexistent `app/assets/tailwind/{helpers,views}` causing Baldur template utility classes to be missing from compiled CSS.
- `script/verify_host_install` now checks engine `@source` path depth and validates Baldur utility classes in compiled CSS.

### Added

- `ui_theme_toggle` helper — first-class theme toggle component (switch + compact icon button) wired to the Baldur theme controller.
- `ui_auth_page` now accepts `top_rail:` parameter to render an action bar above the brand lockup (e.g. theme toggle, version label).
- `.auth-page__top-rail` CSS for right-aligned top rail in auth pages.
- `docs/theme.md` — theme controller setup, brand-token customization, and font mapping guide.
- `docs/auth.md` — top rail and theme toggle usage examples.
- `docs/styling.md` — brand-token table with do/don't guidance.
- Generated `theme.css` template comments now clearly separate brand inputs, semantic tokens, and font mapping.
- `test/engine_css_test.rb` — regression test for engine `@source` path depth.
- `test/theme_toggle_helper_test.rb` — render tests for `ui_theme_toggle` and auth page `top_rail`.

## [0.2.0]

### Added

- UI helpers and components for authenticated app shells and marketing surfaces.
- Generator-based install flow for host apps.
- Engine-owned Tailwind build integration.
