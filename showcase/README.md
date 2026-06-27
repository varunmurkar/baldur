# Baldur Showcase

A committed host Rails app for visual smoke checks, keyboard/a11y exploration,
and copy-paste component examples. It loads the local `baldur` gem from the
parent directory, so it always tracks the gem source.

## Run locally

```sh
cd showcase
bundle install
bundle exec rails tailwindcss:build
bundle exec rails server
```

Then open `http://localhost:3000`.

If you change gem views or styles, rebuild Tailwind or run watch:

```sh
bundle exec rails tailwindcss:watch
```

## Run tests

```sh
cd showcase
bundle exec ruby test/showcase_render_smoke_test.rb
```

## Structure

- `app/controllers/showcase/` — showcase-only controllers
- `app/views/showcase/components/` — static component inventory
- `app/views/showcase/interactions/` — keyboard/focus/behavior pages
- `app/views/showcase/patterns/` — common compositions
- `app/views/showcase/shared/` — layout + example card partial
- `app/assets/stylesheets/showcase.css` — showcase-only CSS

Nothing in this directory ships with the gem. The root `baldur.gemspec` only
packages `{app,config,docs,lib,script,test}` at the project root.
