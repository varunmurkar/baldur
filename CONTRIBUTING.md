# Contributing to Baldur

Thanks for helping make Baldur better.

## Before You Start

1. Open an issue if the change is non-trivial so we can agree on direction first.
2. Read the relevant docs in `docs/` before changing behavior.
3. Update docs, tests, and the changelog in the same PR as code changes.

## Local Setup

```sh
bundle install
```

## Running Tests

```sh
bundle exec ruby test/run_all.rb
```

## Adding New Components or Helpers

- Add the view partial under `app/views/baldur/components/`
- Add the helper in the appropriate `app/helpers/baldur/` module
- Export it through `app/helpers/baldur/ui_helper.rb` if it is a core surface
- Add a generator shim in `lib/generators/baldur/install/install_generator.rb` if it ships a Stimulus controller
- Add a test in `test/`
- Add or update the matching doc in `docs/`
- Update `README.md` if the feature is user-facing

## PR Checklist

- [ ] Tests pass
- [ ] Gem builds cleanly (`gem build baldur.gemspec`)
- [ ] Docs updated for behavior changes
- [ ] README updated if the feature is user-facing
- [ ] `CHANGELOG.md` updated under `Unreleased`
- [ ] No secrets or credentials committed

## Releasing

Maintainers only. See [docs/security.md](docs/security.md) and `.github/workflows/release.yml`.
