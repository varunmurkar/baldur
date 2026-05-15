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
