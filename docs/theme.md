# Theme

Baldur ships a light/dark theme system backed by CSS custom properties and a Stimulus controller.

## Quick Setup

1. Mount the theme controller on a high-level element (typically `<body>`):

```erb
<body data-controller="theme">
  <%= yield %>
</body>
```

2. Render a theme toggle where needed:

```erb
<%= ui_theme_toggle %>
```

That is all — the controller initializes on connect, reads any stored preference, and applies the class.

## Theme Controller

`baldur/controllers/theme_controller` is included in the base install shim (`app/javascript/controllers/theme_controller.js`).

### How It Works

| Step | Behavior |
|------|----------|
| Connect | Reads stored preference from `localStorage` (`baldur.theme` by default). Falls back to `"light"`. |
| Apply | Adds the theme class (`"light"` or `"dark"`) to `<html>`. Sets `data-theme` attribute. |
| Toggle | Checkbox inputs with `data-theme-target="toggle"` sync checked state. Compact icon buttons use `data-action="click->theme#toggle"`. |
| Persist | Stores chosen theme to `localStorage` under `baldur.theme`. |

### Values

| Value | Type | Default | Purpose |
|-------|------|---------|---------|
| `storageKey` | String | `"baldur.theme"` | localStorage key for persistence |
| `themes` | Array | `["light", "dark"]` | Theme class names to cycle |

### Targets

| Target | Element | Purpose |
|--------|---------|---------|
| `toggle` | Checkbox `<input>` | Syncs checked state (`checked` = dark) |

### Public API

The controller exposes methods for programmatic use:

```js
// Read current theme
this.application.getControllerForElementAndContainer(document.body, "theme").getTheme()

// Set theme explicitly
controller.setTheme("dark")          // animated (default)
controller.setTheme("dark", { animate: false })
```

### Animation

When theme changes, the controller briefly adds `theme-transition` to `<html>` (800ms). Define this class in your CSS to control the transition:

```css
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition: background-color 300ms ease, color 300ms ease !important;
}
```

## Brand Token Customization

Baldur derives all semantic colors from four brand input tokens. Override only these in your host `theme.css`:

| Token | Default (oklch) | Purpose |
|-------|-----------------|---------|
| `--_primary-base` | `0.682 0.157 27.1` | Primary actions, CTA |
| `--_secondary-base` | `0.2968 0.0383 195.29` | Sidebar, nav, subdued surfaces |
| `--_accent-base` | `0.482 0.067 91.7` | Highlights, badges, tags |
| `--_neutral-base` | `0.8672 0 0` | Surfaces, text, borders |

### Do

```css
:root {
  --_primary-base: oklch(0.55 0.22 260);
}
```

### Do Not

```css
:root {
  --color-primary: oklch(0.55 0.22 260);       /* Baldur owns semantic outputs */
  --color-surface: white;                       /* Breaks dark-mode mapping */
}
```

Baldur automatically maps brand inputs through scale/tone stops and resolves them into light and dark semantic roles. Overriding a semantic token directly breaks that mapping.

## Font Mapping

1. Load web fonts in `app/assets/stylesheets/fonts.css` (before Tailwind).
2. Map loaded families to font tokens in `app/assets/stylesheets/theme.css` (after Baldur build):

```css
:root {
  --font-body: "Geist", "Inter", system-ui, sans-serif;
  --font-heading: var(--font-body);
  --font-ui: var(--font-body);
}
```

Baldur uses `--font-body` as the default for body, heading, and UI text. Override `--font-heading` or `--font-ui` separately only when you need a different family for those roles.