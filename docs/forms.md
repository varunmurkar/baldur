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

## Hidden Inputs

For hidden state fields, use `ui_hidden_field_tag` if you want Baldur helper naming consistency:

```erb
<%= ui_hidden_field_tag :planner_tab, "targets" %>
```

It is a thin wrapper around Rails `hidden_field_tag`, so plain `hidden_field_tag` remains acceptable too.

## When to Use Raw Rails Helpers

Prefer raw Rails helpers when Baldur is not adding meaningful value to the field shape.

Good examples:

- simple hidden fields
- low-level form builder integrations
- one-off HTML attributes that already fit naturally inside `input_options:`

Prefer Baldur helpers when you want shared label, support text, styling, and component structure.
