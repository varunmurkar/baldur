# Baldur

Baldur is a reusable Rails UI engine for apps using the same frontend stack as this repository:

- Rails 8
- Propshaft
- `importmap-rails`
- `stimulus-rails`
- `tailwindcss-rails`

## Install Into Another App

1. Add Baldur to the target app `Gemfile`:

Baldur now declares `tailwindcss-rails` as a gem dependency, so hosts do not need to add that gem separately unless they want to pin a specific version.

```ruby
gem "baldur"
```

2. Run:

```sh
bundle install
bundle exec rails tailwindcss:engines
bundle exec rails generate baldur:install
```

3. Rebuild Tailwind:

```sh
bundle exec rails tailwindcss:build
```

`tailwindcss:engines` creates `app/assets/builds/tailwind/baldur.css` from the engine-owned Tailwind entrypoint. `baldur:install` then imports that generated build into the host Tailwind entrypoint.

If the host app already runs `tailwindcss:build` or `tailwindcss:watch`, those commands will also create the engine build automatically once the engine entrypoint exists.

4. Install optional surfaces as needed:

```sh
bundle exec rails generate baldur:install_panel_secondary
bundle exec rails generate baldur:install_google_auth
```

Default install behavior keeps Geist loaded through the host `fonts.css` scaffold. If a host app wants a different stack, it should update `fonts.css` and then map the loaded families in `theme.css`.

## Styling Ownership

Tailwind provides the utility/base layer. Baldur is the source of truth for shared design-system primitives.

- Import host `fonts.css` before Tailwind so the host controls what font families get loaded.
- Import the generated Baldur Tailwind engine build into the host Tailwind entrypoint.
- Import host `theme.css` after the Baldur build to override only the base palette inputs and font-token mapping.
- Treat host `fonts.css` as the project-specific font loading layer.
- Treat host `theme.css` as the project-specific override layer for palette, font-token mapping, and other brand inputs, not as a place to fork Baldur-owned primitive styles.
- Add host-app styles only for app-specific surfaces after Baldur.
- Do not re-import or override host-local copies of Baldur-owned primitives such as buttons, forms, snackbars, or tables.
- Keep shared elevation semantics in Baldur-owned `--elev-*` tokens. If a host app needs softer or stronger shared shadows, change the Baldur token source instead of swapping raw Tailwind shadow utilities into Baldur-owned primitives.
- Do not keep duplicate copies of Baldur-owned primitives under `app/assets/stylesheets/application/`; leave only app-specific files there.
- Do not keep host copies of Baldur semantic theme files such as `theme/light.css` or `theme/dark.css`.

## What The Installer Assumes

- Tailwind entrypoint exists at `app/assets/tailwind/application.css`
- Host app gets `tailwindcss-rails` through Baldur or its own Gemfile and uses engine builds
- Host app uses importmap Stimulus boot with `app/javascript/controllers`
- Host app gets `app/assets/stylesheets/fonts.css` for font loading and `app/assets/stylesheets/theme.css` for brand and font-token overrides
- Host app can import `app/assets/builds/tailwind/baldur.css` from `app/assets/tailwind/application.css`

## Building UI

Canonical Ruby internals live under `Baldur::*`, but the default DX is `ui_*` helpers through the generated `UiHelper` include.

Examples:

```erb
<%= ui_button(label: "Save", href: "#") %>

<%= ui_card(title: "Revenue") do %>
  <p>Content</p>
<% end %>

<%= ui_panel_secondary(id: "assistant", title: "Assistant", trigger_label: "Open") do %>
  <p>Panel content</p>
<% end %>
```

External triggers can open a Baldur panel declaratively:

```erb
<button
  type="button"
  data-open-panel="#assistant"
  data-panel-payload="<%= json_escape({ source: "dashboard" }.to_json) %>">
  Open assistant
</button>
```

`panel-secondary` emits `baldur:panel:opened` and `baldur:panel:closed` on the panel shell and `window`. The event detail includes `id`, `selector`, `trigger`, and parsed `payload`.

For modals, prefer `ui_modal` directly:

```erb
<%= ui_modal(id: "confirm-delete", title: "Delete item") do %>
  <p>This action cannot be undone.</p>
<% end %>
```

If a host app keeps a shared wrapper partial around `ui_modal`, treat `modal_body:` as the wrapper-local input and let the wrapper pass that content into `ui_modal`. Avoid calling a wrapper with `body:` through `render`, since `body` collides with Rails render options.

For horizontal primary/secondary CTA groups, prefer `ui_action_row`:

```erb
<%= ui_action_row(
  secondary_button: { label: "Back", variant: :outline, href: settings_path },
  primary_button: { label: "Save", variant: :primary, type: :submit }
) %>
```

The action row owns the responsive layout and keeps the primary CTA last on the right.

Use `ui_alert` for inline status surfaces. Alerts support optional inline actions and opt-in collapsed state:

```erb
<%= ui_alert(
  variant: :warning,
  title: "Data freshness warning",
  actions: ui_button(label: "Upload Latest Data", href: new_ecommerce_import_path, variant: :primary, size: :sm),
  collapsible: true,
  collapse_key: "tenant-#{current_tenant.id}-executive-pulse-stale-data"
) do %>
  <p>Latest available data is 10 days old.</p>
<% end %>
```

Collapsed alerts stay inline and can be re-expanded with the built-in `More` summary action.

## Tables

Use the table helpers as a small composition system:

- `ui_table` is the table atom.
- `ui_table_card` is the card shell for title, controls, table body, and footer.
- `ui_table_footer` owns the `Show [x] items per page` control and the `Showing x-y of z` status line.
- `ui_pagination` is the page-navigation atom and is usually composed through `ui_table_footer`.

If a table has title, controls, rows, and pagination, render them inside the same `ui_table_card`.

Use `ui_table` directly for embedded or simple tables:

```erb
<%= ui_table(
  columns: [
    { label: "SKU", key: :sku },
    { label: "Status", key: :status },
    { label: "Revenue", key: :revenue, header_class: "text-right", cell_class: "text-right" }
  ],
  rows: [
    { sku: "SKU-001", status: "Active", revenue: number_to_currency(12_500) },
    { sku: "SKU-002", status: "Draft", revenue: number_to_currency(3_800) }
  ],
  empty_state: "No SKUs found"
) %>
```

Use `ui_table_card` when the table is a standalone surface:

```erb
<% table_controls = capture do %>
  <div class="flex items-end gap-3">
    <%= ui_menu_select_tag :status,
          options: [
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" }
          ],
          selected: params[:status].presence || "all",
          label: "Status" %>
  </div>
<% end %>

<%= ui_table_card(
  title: "Products",
  description: "Track inventory and performance in one place.",
  controls: table_controls,
  controls_position: :header,
  footer: ui_table_footer(
    current_page: @pagination[:current_page],
    total_pages: @pagination[:total_pages],
    total_count: @pagination[:total_count],
    per_page: @pagination[:per_page],
    path_builder: ->(page) { products_path(request.query_parameters.merge(page: page, per_page: @pagination[:per_page])) },
    rows_per_page_param: "per_page",
    rows_per_page_options: [10, 20, 50],
    rows_per_page_selected: @pagination[:per_page]
  )
) do %>
  <%= ui_table(
    sort: { key: params[:sort], direction: params[:direction] },
    sort_path_builder: ->(sort_key, direction) { products_path(request.query_parameters.merge(sort: sort_key, direction: direction, page: 1)) },
    columns: [
      { label: "SKU", key: :sku, sortable: true, sort_key: "sku" },
      { label: "Status", key: :status },
      {
        label: "Revenue",
        key: :revenue,
        sortable: true,
        sort_key: "revenue",
        header_class: "text-right",
        cell_class: "text-right",
        header_tooltip: "Total revenue attributed to the current filter window."
      }
    ],
    rows: @rows,
    empty_state: "No products found"
  ) %>
<% end %>
```

Use `controls_position: :header` for compact data-view controls that belong in the top-right header zone. Keep the default `:row` placement for wider filter bars. You can also pass `title_meta:` to render subdued inline metadata beside the title, for example `title_meta: "24 rows"`.

Sorting is opt-in: header sort controls render only when a column is marked `sortable: true` and the table receives `sort:` plus `sort_path_builder:`.

Use `ui_pagination` directly only when you need bare page navigation without the table-footer composition.

## Marketing Templates

Keep marketing-page templates separate from app UI primitives. Baldur’s low-level atoms still live under the shared `ui_*` component layer, while full-page marketing surfaces use dedicated `ui_marketing_*` helpers.

Current canonical marketing helpers:

- `ui_marketing_top_nav`
- `ui_marketing_hero_section(variant: :solar_system, ...)`
- `ui_marketing_features_section`
- `ui_marketing_testimonials_section(variant: :bento, ...)`
- `ui_marketing_faq_section`
- `ui_marketing_cta_banner`
- `ui_marketing_pricing_tables`
- `ui_marketing_footer`

Use the existing landing and pricing templates as the canonical v1 variants. Future hero or testimonial layouts should be added as new variants, not folded into the existing default markup.

Marketing nav/footer branding comes from `config.marketing_brand` in the Baldur initializer. Hosts can override that deployment-level default per render by passing `brand:` into `ui_marketing_top_nav` or `ui_marketing_footer`. If a future host needs tenant-specific or whitelabel branding, resolve/cache that in the app and pass the resolved values through `brand:` rather than teaching Baldur about tenant lookup.

Interactive marketing templates ship with Baldur-owned Stimulus controllers. `baldur:install` now generates `marketing_tabs_controller.js` and `marketing_pricing_controller.js` shims so features tabs and pricing billing toggles do not depend on host-specific controller names.

`config.marketing_brand` supports `name`, `wordmark`, `logo_src`, `logo_alt`, and optional `href`. Hosts should treat that config as the canonical branding contract instead of relying on helper-method coupling.

Example hero usage:

```erb
<%= ui_marketing_hero_section(
  variant: :solar_system,
  headline: "Turn Every Data Point Into ROI",
  body: "Connect fragmented data into one decision engine.",
  primary_action: { label: "Book a Demo", variant: :primary, href: dashboard_path },
  secondary_action: { label: "See Use Cases", variant: :outline, href: "#use-cases" },
  supporting_action: { href: "#", label: "Watch walkthrough", data: { open_modal: "#walkthrough-modal" } },
  callouts: [
    { label: "Unified decision context" },
    { label: "Prioritized recommendations" },
    { label: "Impact-aware next actions" }
  ],
  orbit_sources: [
    { name: "Shopify", asset_path: "/landing/source-logos/shopify.svg" },
    { name: "HubSpot", asset_path: "/landing/source-logos/hubspot.svg" }
  ],
  centerpiece_image: { src: "/branding/logo.png", alt: "Acme logo" }
) %>
```

Example features section usage:

```erb
<%= ui_marketing_features_section(
  title: "What Mimir unlocks for your teams",
  description: "Tailored to your business model and decision priorities.",
  tabs: [
    {
      value: "ecommerce",
      label: "E-commerce",
      selected: true,
      panel_title: "E-commerce",
      panel_body: "Priority ROI plays for commerce teams.",
      cards: [
        { title: "Which products should I run campaigns for?", body: "Rank SKUs by incremental margin potential." }
      ]
    }
  ],
  cta: { label: "Get a demo tailored for you", variant: :primary, href: dashboard_path }
) %>
```

## Snackbars

Use semantic snackbar tones:

- `:success` for green success states
- `:notice` for blue notice/info states
- `:warning` for amber warning states
- `:error` for red error states

Host apps should map `flash[:notice]` to `:notice` and `flash[:alert]` to `:error` unless they have a stronger semantic signal available.

## Smoke Check

Run this from the host app root after installation:

```sh
bundle exec ruby "$(bundle show baldur)/script/verify_host_install"
```

That verifies the host can render core helpers and confirms the Tailwind entrypoint contains the required Baldur imports.

## Deferred Work

See `TODO.md` for work intentionally deferred until the dedicated gem repo exists.
