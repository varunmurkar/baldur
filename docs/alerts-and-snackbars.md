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
