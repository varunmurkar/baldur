# Baldur

[![Gem Version](https://badge.fury.io/rb/baldur.svg)](https://badge.fury.io/rb/baldur) [![CI](https://github.com/varunmurkar/baldur/actions/workflows/ci.yml/badge.svg)](https://github.com/varunmurkar/baldur/actions)

Batteries-included opinionated Rails UI engine for the importmap, Stimulus, Tailwind stack. Baldur helps Rails teams ship polished UI faster with install generators, reusable ui_* helpers, Tailwind components, and Stimulus wiring for apps using Propshaft, importmap-rails, stimulus-rails, and tailwindcss-rails.

## Supported Stack

- **Ruby** `>= 3.3`
- **Rails** `>= 7.0`
- Propshaft
- `importmap-rails`
- `stimulus-rails`
- `tailwindcss-rails` `>= 4.3.0`

It ships install generators, ready `ui_*` helpers, Tailwind components, and Stimulus controllers so host teams can skip rebuilding common UI primitives per app.

## Install

Add to your `Gemfile`:

```ruby
gem "baldur", ">= 0.1.3"
```

Run:

```sh
bundle install
bundle exec rails tailwindcss:engines
bundle exec rails generate baldur:install
```

Rebuild Tailwind:

```sh
bundle exec rails tailwindcss:build
```

Optional surfaces:

```sh
bundle exec rails generate baldur:install_panel_secondary
bundle exec rails generate baldur:install_google_auth
```

## Example

Render a sidebar with navigation and a main content area:

```erb
<%= ui_sidebar(
      brand_path: root_path,
      primary_links: [
        { name: "Dashboard", path: root_path, icon: "layout-dashboard", active: current_page?(root_path) }
      ]
    ) do |_sidebar| %>
  <main class="flex-1 p-6">
    <h1>Dashboard</h1>
  </main>
<% end %>
```

## Getting Started

- See [docs/installation.md](docs/installation.md) for install steps.
- See [docs/sidebar.md](docs/sidebar.md) and [docs/auth.md](docs/auth.md) for common usage patterns.

## Documentation

- [Installation](docs/installation.md)
- [Styling](docs/styling.md)
- [Sidebar](docs/sidebar.md)
- [Auth](docs/auth.md)
- [Modals and Panels](docs/modals-and-panels.md)
- [Alerts and Snackbars](docs/alerts-and-snackbars.md)
- [Tables](docs/tables.md)
- [Marketing](docs/marketing.md)
- [Security](docs/security.md)

## Security

See [docs/security.md](docs/security.md) for artifact verification, MFA requirements, and vulnerability reporting.

## Available Now

- [x] Host app brand theming via `theme.css` and `config.marketing_brand`
- [x] Reusable auth page shell for sign-in, sign-up, and password reset
- [x] Core UI helpers, Tailwind components, and Stimulus wiring

## Roadmap

### Installing
- Harden `baldur:install` so host assumptions are reduced
- Expand `script/verify_host_install` coverage
- Add end-to-end install verification in dummy app

### Showcase
- Add a dedicated dummy app for visual smoke checks
- Add component inventory/showcase page in dummy app
- Add interaction showcase pages for modal, sidebar, menu select, snackbar, and panel_secondary
- Add copy-paste examples for core surfaces from the showcase app back into docs

### Starter Templates
- Add dedicated password reset templates
- Add magic link templates
- Add error/system pages
- Add starter settings page layout
- Add starter CRUD index/show/form templates
- Add starter dashboard shell/page templates

### Forms
- Add Rails form-builder integration for Baldur fields
- Bind labels, hints, errors, and invalid states automatically
- Document model-bound form usage

### Tables and Resource Screens
- Add a higher-level resource index pattern on top of existing table primitives
- Support search, filters, row actions, bulk select, and empty states
- Document recommended resource index composition

### Theming
- Add a small set of starter theme presets
- Improve dark-mode/theme controller documentation
- Document brand-token customization more clearly

### Accessibility
- Audit keyboard and focus behavior across interactive components
- Add accessibility-focused tests for core surfaces
- Document a11y guarantees and known gaps

### Internationalization
- Add I18n-friendly labels/messages for reusable helpers
- Remove hard-coded helper copy where practical
- Document translation override points

## Contributing

Open an issue or PR. Before you start, read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/security.md](docs/security.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
