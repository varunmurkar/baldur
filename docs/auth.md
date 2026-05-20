# Auth

## When to Use

Use `ui_auth_page` for sign-in, sign-up, and password-reset layouts. It is available after base install.

## Quick Example

```erb
<%= ui_auth_page(title: "Sign in", description: nil, brand_path: root_path) do %>
  <%= yield %>
<% end %>
```

## Flash Messages

Auth flash messaging can be rendered inside the card by passing `notice:` / `alert:`:

```erb
<%= ui_auth_page(title: "Sign in", description: nil, brand_path: root_path, notice: notice, alert: alert) do %>
  <%= yield %>
<% end %>
```

## Top Rail

Pass `top_rail:` to add an action bar above the brand lockup. The most common use is a theme toggle:

```erb
<%= ui_auth_page(
      title: "Sign in",
      description: nil,
      brand_path: root_path,
      top_rail: ui_theme_toggle,
      notice: notice,
      alert: alert
    ) do %>
  <%= yield %>
<% end %>
```

The `top_rail` slot accepts any rendered content, so it works for other controls too:

```erb
<%= ui_auth_page(
      title: "Sign in",
      description: nil,
      brand_path: root_path,
      top_rail: "<span class='text-sm text-base-content/60'>v2.1.0</span>".html_safe
    ) do %>
  <%= yield %>
<% end %>
```

The host must mount `data-controller="theme"` on a parent element (typically `<body>`) for the theme toggle to function. See `docs/theme.md` for full controller documentation.

## Theme Toggle

`ui_theme_toggle` renders a light/dark switch wired to the Baldur theme controller:

```erb
<%= ui_theme_toggle %>
<%= ui_theme_toggle(aria_label: "Switch appearance", classes: "my-extra-class") %>
```

Requires `data-controller="theme"` on a parent element. See `docs/theme.md` for setup.