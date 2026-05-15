# Sidebar

## When to Use

Use `ui_sidebar` for authenticated application shells. It is part of the base install and includes:

- desktop and mobile sidebar shell markup
- `sidebar` and `mobile-sidebar` controller wiring
- default brand rendering from `config.marketing_brand`
- default nav rendering for primary and secondary links

Host apps provide the route arrays, active-state logic, and any optional slot content.

## Quick Example

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

## Link Options

Each link accepts:

- `name` required label text
- `path` required destination
- `icon` optional Lucide icon name, defaults to `circle`
- `active` optional boolean for `aria-current="page"`
- `title` optional hover title
- `method` optional Rails link method
- `data` optional data attributes hash
- `html_options` optional extra HTML attributes hash

## Brand Behavior

- `brand_name`, `brand_wordmark`, and `brand_logo` are optional
- when omitted, Baldur resolves them from `config.marketing_brand`
- `brand_path` defaults to `#` if the host app does not provide one

## Mobile Behavior

- mobile nav mirrors desktop primary and secondary links automatically
- the install generator ships both `sidebar_controller.js` and `mobile_sidebar_controller.js`

## Slots vs Params

You can adopt `ui_sidebar` with no slots. The block content becomes the main app surface beside the sidebar:

```erb
<%= ui_sidebar(
      brand_path: root_path,
      primary_links: sidebar_primary_links,
      secondary_links: sidebar_secondary_links,
      secondary_label: "Admin"
    ) do |_sidebar| %>
  <main id="main-content" class="flex-1 p-6">
    <%= yield %>
  </main>
<% end %>
```

For host-specific sidebar surfaces, prefer slots. `*_content` params are also supported for incremental adoption.

```erb
<%= ui_sidebar(
      brand_path: root_path,
      primary_links: sidebar_primary_links,
      secondary_links: sidebar_secondary_links,
      secondary_label: "Admin"
    ) do |sidebar| %>
  <% sidebar.with_header do %>
    <%= render "layouts/tenant_switcher" %>
  <% end %>

  <% sidebar.with_footer do %>
    <div class="space-y-2">
      <p class="text-sm text-muted"><%= current_user.email %></p>
      <%= ui_button(label: "Sign out", href: logout_path, method: :delete, variant: :text, size: :sm, icon: "log-out") %>
    </div>
  <% end %>
<% end %>
```

## Ownership

Host apps own:

- route definitions
- active-state logic
- app-specific header/footer content

Baldur owns:

- desktop and mobile sidebar shell markup
- toggle behavior wiring
- default brand rendering
- default nav rendering
