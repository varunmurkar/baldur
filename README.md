# Baldur

[![Gem Version](https://badge.fury.io/rb/baldur.svg)](https://badge.fury.io/rb/baldur)

Baldur is a batteries-included Rails UI engine for apps using this stack:

- Rails 8
- Propshaft
- `importmap-rails`
- `stimulus-rails`
- `tailwindcss-rails`

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

- [ ] Accessibility improvements and broader a11y audit
- [ ] I18n support
- [ ] Additional auth and system templates beyond the generic shell (magic link, error pages)
- [ ] More reusable page templates

## License

MIT. See [LICENSE](LICENSE).
