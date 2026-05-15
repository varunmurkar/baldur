# Modals and Panels

## Modals

Prefer `ui_modal` directly:

```erb
<%= ui_modal(id: "confirm-delete", title: "Delete item") do %>
  <p>This action cannot be undone.</p>
<% end %>
```

If a host app keeps a shared wrapper partial around `ui_modal`, treat `modal_body:` as the wrapper-local input and let the wrapper pass that content into `ui_modal`. Avoid calling a wrapper with `body:` through `render`, since `body` collides with Rails render options.

## Panels

`ui_panel_secondary` is part of the optional panel surface. Install it if needed:

```sh
bundle exec rails generate baldur:install_panel_secondary
```

Example usage:

```erb
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

## Action Rows

For horizontal primary/secondary CTA groups, prefer `ui_action_row`:

```erb
<%= ui_action_row(
  secondary_button: { label: "Back", variant: :outline, href: settings_path },
  primary_button: { label: "Save", variant: :primary, type: :submit }
) %>
```

The action row owns the responsive layout and keeps the primary CTA last on the right.
