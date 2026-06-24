# Tabs and Segmented Controls

## What It Is

Use `ui_segmented_buttons` as Baldur's tabs trigger primitive, not only as a visual button group.

Today it already renders tab-oriented trigger semantics:

- wrapper `role="tablist"`
- each trigger `role="tab"`
- `aria-selected`
- roving `tabindex`

That makes it a good starting point for tabs. Host apps still own panel markup, panel visibility, and any state persistence.

## Helper API

```ruby
ui_segmented_buttons(items:, aria_label: "Tabs", classes: nil)
```

For hidden tab state inside forms, Baldur also ships `ui_hidden_field_tag(name, value = nil, options = {})`. It is a thin wrapper around Rails `hidden_field_tag`, so either helper is acceptable. Prefer `ui_hidden_field_tag` when you want app code to stay on Baldur helper naming consistently.

Each item can include:

- `label`
- `value`
- `selected`
- `disabled`
- `icon`
- `badge_label`
- `sr_label`
- `data`
- `class`

## Quick Example

Server-render the selected tab from params or controller state:

```erb
<% current_tab = params[:tab].presence || "overview" %>

<%= ui_segmented_buttons(
  aria_label: "Catalog tabs",
  items: [
    { label: "Overview", value: "overview", selected: current_tab == "overview" },
    { label: "Products", value: "products", selected: current_tab == "products" },
    { label: "Settings", value: "settings", selected: current_tab == "settings" }
  ]
) %>

<section role="tabpanel"
         class="<%= current_tab == "overview" ? nil : "hidden" %>"
         aria-hidden="<%= (current_tab != "overview").to_s %>">
  ...overview content...
</section>

<section role="tabpanel"
         class="<%= current_tab == "products" ? nil : "hidden" %>"
         aria-hidden="<%= (current_tab != "products").to_s %>">
  ...products content...
</section>

<section role="tabpanel"
         class="<%= current_tab == "settings" ? nil : "hidden" %>"
         aria-hidden="<%= (current_tab != "settings").to_s %>">
  ...settings content...
</section>
```

## Cookbook

### Local Instant Switching

`baldur:install` already generates a `segmented_tabs_controller.js` shim. Use it for instant client-side tab switching without a round trip.

Note: the shipped controller reads `data-tab-value`, so include `tab_value:` in each item's `data:` hash.

```erb
<div data-controller="segmented-tabs"
     data-segmented-tabs-active-value="overview">
  <%= ui_segmented_buttons(
    aria_label: "Report tabs",
    items: [
      {
        label: "Overview",
        value: "overview",
        selected: true,
        data: {
          action: "click->segmented-tabs#select",
          segmented_tabs_target: "tab",
          tab_value: "overview"
        }
      },
      {
        label: "Targets",
        value: "targets",
        data: {
          action: "click->segmented-tabs#select",
          segmented_tabs_target: "tab",
          tab_value: "targets"
        }
      },
      {
        label: "History",
        value: "history",
        data: {
          action: "click->segmented-tabs#select",
          segmented_tabs_target: "tab",
          tab_value: "history"
        }
      }
    ]
  ) %>

  <section role="tabpanel"
           data-segmented-tabs-target="panel"
           data-tab-value="overview">
    <p>Overview content</p>
  </section>

  <section role="tabpanel"
           class="hidden"
           aria-hidden="true"
           data-segmented-tabs-target="panel"
           data-tab-value="targets">
    <p>Targets content</p>
  </section>

  <section role="tabpanel"
           class="hidden"
           aria-hidden="true"
           data-segmented-tabs-target="panel"
           data-tab-value="history">
    <p>History content</p>
  </section>
</div>
```

What controller does:

- toggles `.is-selected` on triggers
- updates `aria-selected`
- updates `tabindex`
- toggles `.hidden` and `aria-hidden` on panels

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
          label: "Summary",
          value: "summary",
          selected: current_tab == "summary",
          data: {
            action: "click->report-tabs#submitTab",
            report_tabs_target: "tab",
            report_tab_value: "summary"
          }
        },
        {
          label: "Imports",
          value: "imports",
          selected: current_tab == "imports",
          data: {
            action: "click->report-tabs#submitTab",
            report_tabs_target: "tab",
            report_tab_value: "imports"
          }
        },
        {
          label: "Errors",
          value: "errors",
          selected: current_tab == "errors",
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
      <%= render "summary" %>
    <% when "imports" %>
      <%= render "imports" %>
    <% when "errors" %>
      <%= render "errors" %>
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
    aria_label: "Report form tabs",
    items: [
      {
        label: "Details",
        value: "details",
        selected: selected_tab == "details",
        data: {
          action: "click->report-form-tabs#switch",
          report_form_tabs_target: "tab",
          report_tab_value: "details"
        }
      },
      {
        label: "Targets",
        value: "targets",
        selected: selected_tab == "targets",
        data: {
          action: "click->report-form-tabs#switch",
          report_form_tabs_target: "tab",
          report_tab_value: "targets"
        }
      }
    ]
  ) %>

  <section role="tabpanel"
           data-report-form-tabs-target="panel"
           data-report-tab-panel="details"
           class="<%= selected_tab == "details" ? nil : "hidden" %>"
           aria-hidden="<%= (selected_tab != "details").to_s %>">
    ...details fields...
  </section>

  <section role="tabpanel"
           data-report-form-tabs-target="panel"
           data-report-tab-panel="targets"
           class="<%= selected_tab == "targets" ? nil : "hidden" %>"
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

  connect() {
    this.show(this.currentTabValue || this.hiddenInputTarget.value || "details")
  }

  switch(event) {
    const tab = event.currentTarget.dataset.reportTabValue
    if (!tab) return

    this.show(tab)
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

## Accessibility Notes

`ui_segmented_buttons` already gives you tab-style trigger semantics, but it is still a primitive rather than a complete APG-perfect tabs system.

Current strengths:

- `role="tablist"` on wrapper
- `role="tab"` on triggers
- `aria-selected`
- roving `tabindex`

Current host responsibilities:

- render matching `role="tabpanel"` containers
- keep only active panel visible
- keep `aria-hidden` aligned with hidden state when panels are hidden
- preserve selected state across params, Turbo renders, or form rerenders

Current gaps to be aware of:

- helper does not currently expose per-tab `id` or `aria-controls`
- shipped controller handles click selection, not full arrow-key tab navigation

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
