# Alerts and Snackbars

## Alerts

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

## Snackbars

Use semantic snackbar tones:

- `:success` for green success states
- `:notice` for blue notice/info states
- `:warning` for amber warning states
- `:error` for red error states

Host apps should map `flash[:notice]` to `:notice` and `flash[:alert]` to `:error` unless they have a stronger semantic signal available.

### Snackbar stack layout

Give the global stack an `id` so it can be targeted from the server:

```erb
<%= ui_snackbar_stack(
  snackbars: snackbar_flash_payloads(flash),
  id: "snackbar-stack"
) %>
```

Use `class_name:` and `data:` to extend the wrapper. Baldur always keeps the base class `snackbar-stack` and the `data-baldur-snackbar-stack` hook.

### Turbo Stream updates

For Hotwire apps, call `ui_snackbar_turbo_stream` from a Turbo Stream view to refresh the stack in place:

```erb
<%# app/views/users/create.turbo_stream.erb %>
<%= ui_snackbar_turbo_stream(flash) %>
```

This is the same as:

```erb
<%= turbo_stream.update(
  "snackbar-stack",
  html: ui_snackbar_stack(
    snackbars: snackbar_flash_payloads(flash),
    id: "snackbar-stack"
  )
) %>
```

Change the target with `target:`:

```erb
<%= ui_snackbar_turbo_stream(flash, target: "frame-snackbar-stack") %>
```

`ui_snackbar_turbo_stream` is opt-in. If the host app does not use `turbo-rails`, calling it raises a clear `ArgumentError` at runtime. Non-Turbo apps can continue using `ui_snackbar_stack` with flash payloads the normal way.
