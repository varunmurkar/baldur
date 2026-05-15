# Baldur AI Agent Instructions

## About Baldur

Baldur is an opinionated batteries-included Rails UI engine for apps using the importmap, Stimulus, Tailwind stack. It provides reusable `ui_*` helpers, Tailwind components, Stimulus controllers, and install generators for host apps.

## Primary Directive

Before making any code changes, read these project files first:

1. `CONTRIBUTING.md` for contribution rules, local setup, and PR requirements.
2. `CHANGELOG.md` for versioning expectations.
3. `docs/installation.md` for host-app install assumptions.
4. `docs/styling.md` for the styling ownership contract between Baldur and host apps.

## Your Responsibilities

1. Follow the conventions in `docs/` when adding or changing components.
2. Update `CHANGELOG.md` under `Unreleased` for any user-facing change.
3. Update docs in `docs/` when behavior changes.
4. Update `README.md` when a feature is user-facing.
5. Keep this file current when new conventions emerge.

## Important Context

- New UI primitives should stay in `app/views/baldur/components/` and `app/helpers/baldur/`.
- Optional surfaces should ship with their own generator in `lib/generators/baldur/`.
- Host-app files must not be duplicated inside Baldur.
- Do not add host-specific business logic into Baldur helpers.
- Engine CSS uses Tailwind 4 directives (`@source`, `@theme`).

## Reference Files

- `CONTRIBUTING.md` - Full contribution guidelines (read first).
- `CHANGELOG.md` - Versioning and release expectations.
- `docs/installation.md` - Install flow and assumptions.
- `docs/styling.md` - Styling ownership contract.
- `lib/generators/baldur/install/install_generator.rb` - Base install generator.
- `baldur.gemspec` - Dependencies and gem metadata.
