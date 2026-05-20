# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Lowered minimum Rails dependency from `>= 8.1.0` to `>= 7.0.0`.
- Lowered minimum `tailwindcss-rails` dependency from `>= 4.4.0` to `>= 4.3.0`.

### Added

- New task-based `docs/` directory with focused usage guides.
- Public roadmap in `README.md` grouped by initiative.

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
