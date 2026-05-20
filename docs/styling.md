# Styling

## Ownership

Tailwind provides the utility/base layer. Baldur is the source of truth for shared design-system primitives.

Host app responsibilities:

- Load `fonts.css` before Tailwind to control font families.
- Import the generated Baldur Tailwind engine build into the host Tailwind entrypoint.
- Override only base palette inputs and font-token mapping in `theme.css` after the Baldur build.
- Add host-app styles only for app-specific surfaces after Baldur.

Host app restrictions:

- Do not re-import or override host-local copies of Baldur-owned primitives such as buttons, forms, snackbars, or tables.
- Do not keep duplicate copies of Baldur-owned primitives under `app/assets/stylesheets/application/`; leave only app-specific files there.
- Do not keep host copies of Baldur semantic theme files such as `theme/light.css` or `theme/dark.css`.
- Keep shared elevation semantics in Baldur-owned `--elev-*` tokens. If a host needs softer or stronger shared shadows, change the Baldur token source instead of swapping raw Tailwind shadow utilities into Baldur-owned primitives.

## Brand tokens

Baldur derives all semantic colors from four brand input tokens. Override only these in your host `theme.css` — see `docs/theme.md` for the full token reference and customization guide.

In short:

| Token | Purpose |
|-------|---------|
| `--_primary-base` | Primary actions, CTA |
| `--_secondary-base` | Sidebar, nav, subdued |
| `--_accent-base` | Highlights, badges |
| `--_neutral-base` | Surfaces, text, borders |

Do not override semantic `--color-*` tokens (e.g. `--color-primary`, `--color-surface`). Baldur maps brand inputs to semantic outputs automatically for both light and dark modes.