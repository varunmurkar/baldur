# Marketing

## When to Use

Use marketing helpers for landing pages, pricing, and feature surfaces. Keep marketing-page templates separate from app UI primitives. Low-level atoms live under `ui_*`, while full-page marketing surfaces use dedicated `ui_marketing_*` helpers.

## Helpers

- `ui_marketing_top_nav`
- `ui_marketing_hero_section(variant: :solar_system, ...)`
- `ui_marketing_features_section`
- `ui_marketing_testimonials_section(variant: :bento, ...)`
- `ui_marketing_faq_section`
- `ui_marketing_cta_banner`
- `ui_marketing_pricing_tables`
- `ui_marketing_footer`

Use the existing landing and pricing templates as canonical v1 variants. Future hero or testimonial layouts should be added as new variants, not folded into the existing default markup.

## Branding

Marketing nav/footer branding comes from `config.marketing_brand` in the Baldur initializer. Hosts can override that deployment-level default per render by passing `brand:` into `ui_marketing_top_nav` or `ui_marketing_footer`.

If a host needs tenant-specific or whitelabel branding, resolve/cache that in the app and pass the resolved values through `brand:` rather than teaching Baldur about tenant lookup.

`config.marketing_brand` supports `name`, `wordmark`, `logo_src`, `logo_alt`, and optional `href`. Hosts should treat that config as the canonical branding contract instead of relying on helper-method coupling.

## Controllers

Interactive marketing templates ship with Baldur-owned Stimulus controllers. `baldur:install` generates `marketing_tabs_controller.js` and `marketing_pricing_controller.js` shims so features tabs and pricing billing toggles do not depend on host-specific controller names.

## Examples

Hero:

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

Features:

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
