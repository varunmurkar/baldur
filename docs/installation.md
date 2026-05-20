# Installation

## Add the Gem

Add to the host `Gemfile`:

```ruby
gem "baldur", ">= 0.1.3"
```

Baldur declares `tailwindcss-rails >= 4.3.0` as a dependency, so hosts do not need to add it separately unless they want to enforce their own minimum version.

## Install and Generate

```sh
bundle install
bundle exec rails tailwindcss:engines
bundle exec rails generate baldur:install
```

`tailwindcss:engines` creates `app/assets/builds/tailwind/baldur.css` from the engine-owned Tailwind entrypoint.

`baldur:install` imports that generated build into the host Tailwind entrypoint.

If the host already runs `tailwindcss:build` or `tailwindcss:watch`, those commands will also create the engine build once the entrypoint exists.

## Rebuild Tailwind

```sh
bundle exec rails tailwindcss:build
```

## Optional Surfaces

Install only what you need:

```sh
bundle exec rails generate baldur:install_panel_secondary
bundle exec rails generate baldur:install_google_auth
```

`baldur:install` already includes `Baldur::Optional::AuthPageHelper` in the generated `UiHelper`, so `ui_auth_page` is available by default after base install. The generators above are only required when using those specific surfaces.

## Installer Assumptions

- Tailwind entrypoint exists at `app/assets/tailwind/application.css`
- Host app gets `tailwindcss-rails` through Baldur or its own Gemfile and uses engine builds
- Host app uses importmap Stimulus boot with `app/javascript/controllers`
- Host app gets `app/assets/stylesheets/fonts.css` for font loading and `app/assets/stylesheets/theme.css` for brand and font-token overrides
- Host app can import `app/assets/builds/tailwind/baldur.css` from `app/assets/tailwind/application.css`

Default install behavior keeps Geist loaded through the host `fonts.css` scaffold. If the host wants a different stack, update `fonts.css` and then map the loaded families in `theme.css`.

## Smoke Check

After installation, run from the host app root:

```sh
bundle exec rails tailwindcss:build
bundle exec ruby "$(bundle show baldur)/script/verify_host_install"
```

That verifies the host can render core helpers, confirms the Tailwind entrypoint contains the required Baldur imports, and checks that Baldur template utility classes (e.g. `px-6`, `py-4`, `uppercase`, `tracking-wide`) are present in the compiled CSS. If utility classes are missing, the engine `@source` paths in `engine.css` may be misconfigured — ensure they resolve correctly from `app/assets/tailwind/baldur/` to `app/helpers` and `app/views`.
