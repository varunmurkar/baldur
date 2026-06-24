# Tables

## Composition

Use the table helpers as a small composition system:

- `ui_table` is the table atom.
- `ui_table_card` is the card shell for title, controls, table body, and footer.
- `ui_table_footer` owns the `Show [x] items per page` control and the `Showing x-y of z` status line.
- `ui_pagination` is the page-navigation atom and is usually composed through `ui_table_footer`.

If a table has title, controls, rows, and pagination, render them inside the same `ui_table_card`.

## Simple Table

Use `ui_table` directly for embedded or simple tables:

```erb
<%= ui_table(
  columns: [
    { label: "SKU", key: :sku },
    { label: "Status", key: :status },
    { label: "Revenue", key: :revenue, header_class: "text-right", cell_class: "text-right" }
  ],
  rows: [
    { sku: "SKU-001", status: "Active", revenue: number_to_currency(12_500) },
    { sku: "SKU-002", status: "Draft", revenue: number_to_currency(3_800) }
  ],
  empty_state: "No SKUs found"
) %>
```

## Standalone Table with Sort and Pagination

Use `ui_table_card` when the table is a standalone surface:

```erb
<% table_controls = capture do %>
  <div class="flex items-end gap-3">
    <%= ui_menu_select_tag :status,
          options: [
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" }
          ],
          selected: params[:status].presence || "all",
          label: "Status" %>
  </div>
<% end %>

<%= ui_table_card(
  title: "Products",
  description: "Track inventory and performance in one place.",
  controls: table_controls,
  controls_position: :header,
  footer: ui_table_footer(
    current_page: @pagination[:current_page],
    total_pages: @pagination[:total_pages],
    total_count: @pagination[:total_count],
    per_page: @pagination[:per_page],
    path_builder: ->(page) { products_path(request.query_parameters.merge(page: page, per_page: @pagination[:per_page])) },
    rows_per_page_param: "per_page",
    rows_per_page_options: [10, 20, 50],
    rows_per_page_selected: @pagination[:per_page]
  )
) do %>
  <%= ui_table(
    sort: { key: params[:sort], direction: params[:direction] },
    sort_path_builder: ->(sort_key, direction) { products_path(request.query_parameters.merge(sort: sort_key, direction: direction, page: 1)) },
    columns: [
      { label: "SKU", key: :sku, sortable: true, sort_key: "sku" },
      { label: "Status", key: :status },
      {
        label: "Revenue",
        key: :revenue,
        sortable: true,
        sort_key: "revenue",
        header_class: "text-right",
        cell_class: "text-right",
        header_tooltip: "Total revenue attributed to the current filter window."
      }
    ],
    rows: @rows,
    empty_state: "No products found"
  ) %>
<% end %>
```

## Options

- `controls_position: :header` for compact data-view controls in the top-right header zone. Keep `:row` for wider filter bars.
- `title_meta:` renders subdued inline metadata beside the title, for example `title_meta: "24 rows"`.
- Sorting is opt-in: header sort controls render only when a column is marked `sortable: true` and the table receives `sort:` plus `sort_path_builder:`.
- `emphasize_last_column: true` makes the last body cell semibold. The default is `false` so numeric final columns are not unexpectedly bold.
- Use `ui_pagination` directly only when you need bare page navigation without the table-footer composition.
