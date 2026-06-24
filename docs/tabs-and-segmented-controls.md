# Tabs and Segmented Controls

## What It Is

Use `ui_segmented_buttons` as Baldur's tabs trigger primitive, not only as a visual button group.

Today it already renders tab-oriented trigger semantics:

- wrapper `role="tablist"`
- each trigger `role="tab"`
- `aria-selected`
- roving `tabindex`

Combined with the shipped `segmented_tabs_controller.js`, this is now the documented Baldur tabs pattern for:

- selected tab trigger
- tab panels
- ARIA wiring
- keyboard behavior
- hidden / inactive panel handling
- hidden input syncing for form-backed workflows

## Helper API

```ruby
ui_segmented_buttons(items:, aria_label: "Tabs", classes: nil, id: nil, data: nil)
```

For hidden tab state inside forms, Baldur also ships `ui_hidden_field_tag(name, value = nil, options = {})`. It is a thin wrapper around Rails `hidden_field_tag`, so either helper is acceptable. Prefer `ui_hidden_field_tag` when you want app code to stay on Baldur helper naming consistently.

Each item can include:

- `id`
- `label`
- `value`
- `selected`
- `disabled`
- `icon`
- `badge_label`
- `sr_label`
- `aria`
- `data`
- `class`

Recommended tab item keys when using segmented buttons as tabs:

- `id` for the tab trigger element
- `aria: { controls: ... }` for panel association
- `data: { segmented_tabs_target: "tab", tab_value: ... }` for controller wiring

## Quick Example

Server-render the selected tab from params or controller state and wire panels with `aria-controls` / `aria-labelledby`:

```erb
<% current_tab = params[:tab].presence || "overview" %>

<%= ui_segmented_buttons(
  id: "catalog-tabs",
  aria_label: "Catalog tabs",
  items: [
    {
      id: "catalog-tab-overview",
      label: "Overview",
      value: "overview",
      selected: current_tab == "overview",
      aria: { controls: "catalog-panel-overview" }
    },
    {
      id: "catalog-tab-products",
      label: "Products",
      value: "products",
      selected: current_tab == "products",
      aria: { controls: "catalog-panel-products" }
    },
    {
      id: "catalog-tab-settings",
      label: "Settings",
      value: "settings",
      selected: current_tab == "settings",
      aria: { controls: "catalog-panel-settings" }
    }
  ]
) %>

<section id="catalog-panel-overview"
         role="tabpanel"
         aria-labelledby="catalog-tab-overview"
         class="<%= current_tab == "overview" ? nil : "hidden" %>"
         <%= current_tab == "overview" ? nil : 'hidden' %>
         aria-hidden="<%= (current_tab != "overview").to_s %>">
  ...overview content...
</section>

<section id="catalog-panel-products"
         role="tabpanel"
         aria-labelledby="catalog-tab-products"
         class="<%= current_tab == "products" ? nil : "hidden" %>"
         <%= current_tab == "products" ? nil : 'hidden' %>
         aria-hidden="<%= (current_tab != "products").to_s %>">
  ...products content...
</section>

<section id="catalog-panel-settings"
         role="tabpanel"
         aria-labelledby="catalog-tab-settings"
         class="<%= current_tab == "settings" ? nil : "hidden" %>"
         <%= current_tab == "settings" ? nil : 'hidden' %>
         aria-hidden="<%= (current_tab != "settings").to_s %>">
  ...settings content...
</section>
```

## Cookbook

### Local Instant Switching

`baldur:install` already generates a `segmented_tabs_controller.js` shim. Use it for instant client-side tab switching without a round trip.

Controller behavior now includes:

- click selection
- `ArrowLeft` / `ArrowRight` navigation
- `Home` / `End` navigation
- roving `tabindex`
- `.hidden` class toggling
- `hidden` attribute toggling
- `aria-hidden` syncing
- optional hidden input syncing when `hiddenInput` target exists

```erb
<div data-controller="segmented-tabs"
     data-segmented-tabs-active-value="overview">
  <%= ui_segmented_buttons(
    id: "report-tabs",
    aria_label: "Report tabs",
    items: [
      {
        id: "report-tab-overview",
        label: "Overview",
        value: "overview",
        selected: true,
        aria: { controls: "report-panel-overview" },
        data: {
          action: "click->segmented-tabs#select keydown->segmented-tabs#handleKeydown",
          segmented_tabs_target: "tab",
          tab_value: "overview"
        }
      },
      {
        id: "report-tab-targets",
        label: "Targets",
        value: "targets",
        aria: { controls: "report-panel-targets" },
        data: {
          action: "click->segmented-tabs#select keydown->segmented-tabs#handleKeydown",
          segmented_tabs_target: "tab",
          tab_value: "targets"
        }
      },
      {
        id: "report-tab-history",
        label: "History",
        value: "history",
        aria: { controls: "report-panel-history" },
        data: {
          action: "click->segmented-tabs#select keydown->segmented-tabs#handleKeydown",
          segmented_tabs_target: "tab",
          tab_value: "history"
        }
      }
    ]
  ) %>

  <section id="report-panel-overview"
           role="tabpanel"
           aria-labelledby="report-tab-overview"
            data-segmented-tabs-target="panel"
            data-tab-value="overview">
    <p>Overview content</p>
  </section>

  <section id="report-panel-targets"
           role="tabpanel"
           aria-labelledby="report-tab-targets"
            class="hidden"
           hidden
            aria-hidden="true"
            data-segmented-tabs-target="panel"
            data-tab-value="targets">
    <p>Targets content</p>
  </section>

  <section id="report-panel-history"
           role="tabpanel"
           aria-labelledby="report-tab-history"
            class="hidden"
           hidden
            aria-hidden="true"
            data-segmented-tabs-target="panel"
            data-tab-value="history">
    <p>History content</p>
  </section>
</div>
```

Use this mode when all tab content is already on the page and switching should feel instant.

### Server-Driven / Turbo-Backed Tab Selection

For tabs that drive filtering, expensive queries, or frame-local rendering, let server own selected state and re-render the tabs with Turbo. A good pattern is to keep selected tab in params or a hidden field and let Turbo re-render the frame with that state.

```erb
<% current_tab = params[:tab].presence_in(%w[summary imports errors]) || "summary" %>

<%= turbo_frame_tag "catalog-tabs" do %>
  <%= form_with url: reports_path,
                method: :get,
                data: {
                  controller: "report-tabs",
                  turbo_frame: "catalog-tabs",
                  report_tabs_current_tab_value: current_tab
                } do %>
    <%= ui_hidden_field_tag :tab, current_tab, data: { report_tabs_target: "hiddenInput" } %>

    <%= ui_segmented_buttons(
      aria_label: "Catalog tabs",
      items: [
        {
          id: 'catalog-tab-summary',
          label: "Summary",
          value: "summary",
          selected: current_tab == "summary",
          aria: { controls: 'catalog-panel-summary' },
          data: {
            action: "click->report-tabs#submitTab",
            report_tabs_target: "tab",
            report_tab_value: "summary"
          }
        },
        {
          id: 'catalog-tab-imports',
          label: "Imports",
          value: "imports",
          selected: current_tab == "imports",
          aria: { controls: 'catalog-panel-imports' },
          data: {
            action: "click->report-tabs#submitTab",
            report_tabs_target: "tab",
            report_tab_value: "imports"
          }
        },
        {
          id: 'catalog-tab-errors',
          label: "Errors",
          value: "errors",
          selected: current_tab == "errors",
          aria: { controls: 'catalog-panel-errors' },
          data: {
            action: "click->report-tabs#submitTab",
            report_tabs_target: "tab",
            report_tab_value: "errors"
          }
        }
      ]
    ) %>
  <% end %>

  <div class="mt-4">
    <% case current_tab %>
    <% when "summary" %>
      <section id="catalog-panel-summary" role="tabpanel" aria-labelledby="catalog-tab-summary">
        <%= render "summary" %>
      </section>
    <% when "imports" %>
      <section id="catalog-panel-imports" role="tabpanel" aria-labelledby="catalog-tab-imports">
        <%= render "imports" %>
      </section>
    <% when "errors" %>
      <section id="catalog-panel-errors" role="tabpanel" aria-labelledby="catalog-tab-errors">
        <%= render "errors" %>
      </section>
    <% end %>
  </div>
<% end %>
```

Example host controller:

```js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["hiddenInput"]
  static values = { currentTab: String }

  submitTab(event) {
    const tab = event.currentTarget.dataset.reportTabValue
    if (!tab) return

    this.hiddenInputTarget.value = tab
    this.currentTabValue = tab
    this.element.requestSubmit()
  }
}
```

This pattern keeps selected tab in the URL or request params, makes Turbo frame refreshes deterministic, and avoids hidden local-only state.

Use this mode when tab selection changes what the server must load or when the URL should stay shareable.

### Preserving Selected Tab Across Form Submits

When tabs live inside a form, store selected tab in a hidden field so validation rerenders and submit cycles return user to same panel.

```erb
<% selected_tab = params[:report_tab].presence || "details" %>

<%= form_with url: reports_path,
              method: :post,
              data: {
                controller: "report-form-tabs",
                report_form_tabs_current_tab_value: selected_tab
              } do %>
  <%= ui_hidden_field_tag :report_tab,
                          selected_tab,
                          data: { report_form_tabs_target: "hiddenInput" } %>

  <%= ui_segmented_buttons(
    id: 'report-form-tabs',
    aria_label: "Report form tabs",
    items: [
      {
        id: 'report-form-tab-details',
        label: "Details",
        value: "details",
        selected: selected_tab == "details",
        aria: { controls: 'report-form-panel-details' },
        data: {
          action: "click->report-form-tabs#switch keydown->report-form-tabs#handleKeydown",
          report_form_tabs_target: "tab",
          report_tab_value: "details"
        }
      },
      {
        id: 'report-form-tab-targets',
        label: "Targets",
        value: "targets",
        selected: selected_tab == "targets",
        aria: { controls: 'report-form-panel-targets' },
        data: {
          action: "click->report-form-tabs#switch keydown->report-form-tabs#handleKeydown",
          report_form_tabs_target: "tab",
          report_tab_value: "targets"
        }
      }
    ]
  ) %>

  <section id="report-form-panel-details"
           role="tabpanel"
           aria-labelledby="report-form-tab-details"
           data-report-form-tabs-target="panel"
           data-report-tab-panel="details"
            class="<%= selected_tab == "details" ? nil : "hidden" %>"
           <%= selected_tab == "details" ? nil : 'hidden' %>
           aria-hidden="<%= (selected_tab != "details").to_s %>">
    ...details fields...
  </section>

  <section id="report-form-panel-targets"
           role="tabpanel"
           aria-labelledby="report-form-tab-targets"
           data-report-form-tabs-target="panel"
           data-report-tab-panel="targets"
           class="<%= selected_tab == "targets" ? nil : "hidden" %>"
           <%= selected_tab == "targets" ? nil : 'hidden' %>
           aria-hidden="<%= (selected_tab != "targets").to_s %>">
    ...targets fields...
  </section>
<% end %>
```

Example host controller for syncing the hidden field:

```js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["hiddenInput", "panel", "tab"]
  static values = { currentTab: String }

  static TAB_KEYS = ["ArrowLeft", "ArrowRight", "Home", "End"]

  connect() {
    this.show(this.currentTabValue || this.hiddenInputTarget.value || "details")
  }

  switch(event) {
    const tab = event.currentTarget.dataset.reportTabValue
    if (!tab) return

    this.show(tab)
  }

  handleKeydown(event) {
    if (!this.constructor.TAB_KEYS.includes(event.key) || this.tabTargets.length === 0) return

    event.preventDefault()

    const currentIndex = this.tabTargets.indexOf(event.currentTarget)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = this.tabTargets.length - 1
    } else if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % this.tabTargets.length
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + this.tabTargets.length) % this.tabTargets.length
    }

    const nextTab = this.tabTargets[nextIndex]
    if (!nextTab) return

    this.show(nextTab.dataset.reportTabValue)
    nextTab.focus()
  }

  setSubmitTab(event) {
    const tab = event.currentTarget.dataset.reportTabValue
    if (!tab) return

    this.hiddenInputTarget.value = tab
    this.currentTabValue = tab
  }

  show(tab) {
    this.hiddenInputTarget.value = tab
    this.currentTabValue = tab

    this.panelTargets.forEach(panel => {
      const selected = panel.dataset.reportTabPanel === tab
      panel.classList.toggle("hidden", !selected)
      panel.hidden = !selected
      panel.setAttribute("aria-hidden", (!selected).toString())
    })

    this.tabTargets.forEach(button => {
      const selected = button.dataset.reportTabValue === tab
      button.classList.toggle("is-selected", selected)
      button.setAttribute("aria-selected", selected ? "true" : "false")
      button.tabIndex = selected ? 0 : -1
    })
  }
}
```

On server rerender, read `params[:report_tab]` and pass that back into `selected:` so selected trigger and panel match previous submit state. If you have submit buttons that intentionally move the user into another tab before submit, call a dedicated `setSubmitTab` action first.

Use this mode when tabs live inside POST forms and state must survive validation failure, rerender, or submit-driven transitions.

## Accessibility Notes

`ui_segmented_buttons` already gives you tab-style trigger semantics, but it is still a primitive rather than a complete APG-perfect tabs system.

Current strengths:

- `role="tablist"` on wrapper
- `role="tab"` on triggers
- `aria-selected`
- roving `tabindex`
- keyboard handling via the shipped Stimulus controller (`ArrowLeft`, `ArrowRight`, `Home`, `End`)
- optional hidden input syncing via the shipped Stimulus controller

Current host responsibilities:

- render matching `role="tabpanel"` containers
- wire `id` / `aria-controls` / `aria-labelledby`
- keep only active panel visible
- keep `aria-hidden` aligned with hidden state when panels are hidden
- preserve selected state across params, Turbo renders, or form rerenders

Current gaps to be aware of:

- panel markup still belongs to the host app
- there is still no higher-level `ui_tabs` panel DSL

So: document and use `ui_segmented_buttons` as tabs trigger primitive, but do not treat it as a full tabs framework yet.

## Ownership Boundary

Baldur owns:

- segmented trigger markup
- selected-state styling
- baseline tab trigger semantics
- optional local switching controller shim

Host apps own:

- panel markup
- data loading
- URL / params / Turbo contract
- hidden field sync for forms
- richer accessibility polish beyond current primitive
