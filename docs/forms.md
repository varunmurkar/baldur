# Forms

## Text Field Basics

Use `ui_text_field_tag` for Baldur-styled single-line inputs and textareas.

```erb
<%= ui_text_field_tag(
  :company_name,
  "Acme",
  label: "Company name",
  supporting_text: "Shown in billing and exports."
) %>
```

Use Baldur-owned named parameters for common concerns:

- `label:`
- `supporting_text:`
- `type:`
- `required:`
- `disabled:`
- `wrapper_class:`
- `input_class:`
- `multiline:`
- `prefix:`
- `suffix:`

## HTML5 Input Attributes via `input_options`

For raw HTML input attributes, pass them through `input_options:`.

This is the recommended way to set HTML5 attributes such as:

- `step`
- `min`
- `max`
- `inputmode`
- `autocomplete`
- `pattern`
- `maxlength`
- `readonly`
- `data`
- `aria`
- custom `id`

Example:

```erb
<%= ui_text_field_tag(
  :price,
  12.5,
  label: "Price",
  type: :number,
  input_options: {
    step: :any,
    min: 0,
    inputmode: "decimal",
    autocomplete: "off"
  }
) %>
```

Another example with pattern and max length:

```erb
<%= ui_text_field_tag(
  :sku,
  nil,
  label: "SKU",
  input_options: {
    pattern: "[A-Z0-9-]+",
    maxlength: 32,
    autocomplete: "off"
  }
) %>
```

`ui_text_field_tag` forwards `input_options` directly to the underlying `<input>` or `<textarea>` after Baldur applies its own base classes, generated `id`, and accessibility wiring.

## Hidden State Fields

Use hidden fields to preserve UI state that should survive submits, validation rerenders, or Turbo refreshes.

Common examples:

- active tab
- selected filter
- stepped form state
- selected panel

For Baldur-flavored app code, prefer `ui_hidden_field_tag`:

```erb
<%= ui_hidden_field_tag :planner_tab, "targets" %>
```

It is a thin wrapper around Rails `hidden_field_tag`, so both are valid.

### When to Use `ui_hidden_field_tag`

Prefer `ui_hidden_field_tag` when:

- hidden state is part of a documented Baldur interaction pattern
- you want host app helper usage to stay consistently `ui_*`
- the hidden field sits beside other Baldur controls such as segmented buttons, menu selects, or submit flows

### When Plain `hidden_field_tag` Is Acceptable

Plain Rails `hidden_field_tag` is still acceptable when:

- the field is simple Rails glue and Baldur adds no extra meaning
- you are already inside host-specific form builder or low-level Rails form code
- the hidden field is not part of a reusable Baldur interaction pattern

Rule of thumb: if the hidden field is helping a Baldur control preserve UI state, reach for `ui_hidden_field_tag`. If it is generic Rails plumbing, plain `hidden_field_tag` is fine.

### URL Params vs Hidden State

Prefer URL params for state that should be shareable, bookmarkable, or navigable:

- GET-driven tabs
- filters in index screens
- state that should survive refresh and copy-pasted URLs

Prefer hidden fields for state that primarily belongs to an in-form workflow:

- current step in a stepped form
- active tab inside a POST form
- selected panel within a multi-surface editor

Avoid storing the same state in both params and hidden inputs unless the flow truly needs both.

## Hidden State Cookbook

### Active Tab

Inside a form, store the selected tab so rerenders return the user to the same panel:

```erb
<% current_tab = params[:planner_tab].presence || "global" %>

<%= form_with url: planner_path, method: :post do %>
  <%= ui_hidden_field_tag :planner_tab,
                          current_tab,
                          data: { planner_tabs_target: "hiddenInput" } %>

  <%= ui_segmented_buttons(
    aria_label: "Planner tabs",
    items: [
      {
        label: "Global",
        value: "global",
        selected: current_tab == "global",
        data: {
          action: "click->planner-tabs#switch",
          planner_tabs_target: "tab",
          planner_tab_value: "global"
        }
      },
      {
        label: "Targets",
        value: "targets",
        selected: current_tab == "targets",
        data: {
          action: "click->planner-tabs#switch",
          planner_tabs_target: "tab",
          planner_tab_value: "targets"
        }
      }
    ]
  ) %>
<% end %>
```

See `docs/tabs-and-segmented-controls.md` for the full tabs cookbook.

### Filters

For POST-backed filter forms or mixed interactive controls, hidden state can hold the selected filter key:

```erb
<%= form_with url: reports_path, method: :post do %>
  <%= ui_hidden_field_tag :status_filter,
                          params[:status_filter].presence || "active",
                          data: { report_filters_target: "hiddenInput" } %>

  <%= ui_segmented_buttons(
    aria_label: "Status filters",
    items: [
      {
        label: "Active",
        value: "active",
        selected: params[:status_filter] != "archived",
        data: {
          action: "click->report-filters#select",
          report_filter_value: "active"
        }
      },
      {
        label: "Archived",
        value: "archived",
        selected: params[:status_filter] == "archived",
        data: {
          action: "click->report-filters#select",
          report_filter_value: "archived"
        }
      }
    ]
  ) %>
<% end %>
```

If the filter should be shareable in the URL, prefer GET params instead of hidden POST state.

### Stepped Form State

For multi-step forms, hidden state can track current step across validation failures and submit cycles:

```erb
<% current_step = params[:step].presence || "details" %>

<%= form_with url: onboarding_path, method: :post do %>
  <%= ui_hidden_field_tag :step,
                          current_step,
                          data: { onboarding_target: "currentStep" } %>

  <% if current_step == "details" %>
    ...details fields...
    <%= ui_button(label: "Continue", type: :submit, data: { action: "click->onboarding#setStep", onboarding_step_value: "billing" }) %>
  <% elsif current_step == "billing" %>
    ...billing fields...
    <%= ui_button(label: "Review", type: :submit, data: { action: "click->onboarding#setStep", onboarding_step_value: "review" }) %>
  <% end %>
<% end %>
```

Server rerender should read `params[:step]` and send the same value back so the correct step remains visible.

### Selected Panel

When a page has multiple host-owned panels, hidden state can preserve which panel was open when the form submitted:

```erb
<%= form_with url: workspace_path, method: :post do %>
  <%= ui_hidden_field_tag :selected_panel,
                          params[:selected_panel].presence || "summary",
                          data: { workspace_panels_target: "hiddenInput" } %>

  <%= ui_button(label: "Show Details", type: :button, data: { action: "click->workspace-panels#select", workspace_panel_value: "details" }) %>
  <%= ui_button(label: "Show Summary", type: :button, data: { action: "click->workspace-panels#select", workspace_panel_value: "summary" }) %>
<% end %>
```

This is useful when visibility is host-owned but the selected panel should survive submit-driven rerenders.

## When to Use Raw Rails Helpers

Prefer raw Rails helpers when Baldur is not adding meaningful value to the field shape.

Good examples:

- simple hidden fields with no Baldur interaction coupling
- low-level form builder integrations
- one-off HTML attributes that already fit naturally inside `input_options:`

Prefer Baldur helpers when you want shared label, support text, styling, component structure, or a documented interaction pattern.
