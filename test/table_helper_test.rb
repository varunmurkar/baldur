require_relative 'test_helper'

require 'action_controller'

class BaldurTableHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_numeric_column_right_aligns_header_and_cell
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              columns: [
                { label: "SKU", key: :sku },
                { label: "Revenue", key: :revenue, numeric: true }
              ],
              rows: [
                { sku: "SKU-001", revenue: "$12,500" }
              ],
              empty_state: "No records"
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, '<th scope="col" class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-on-surface-variant)] text-right">'
    assert_includes html, '<td class="px-6 py-4 text-sm text-[color:var(--color-on-surface)] text-right">'
  end

  def test_non_numeric_column_stays_left_aligned
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              columns: [
                { label: "SKU", key: :sku },
                { label: "Status", key: :status }
              ],
              rows: [
                { sku: "SKU-001", status: "Active" }
              ],
              empty_state: "No records"
            ) %>
      ERB
      formats: [:html]
    )

    refute_includes html, 'text-right'
  end

  def test_numeric_middle_column_right_aligns
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              columns: [
                { label: "SKU", key: :sku },
                { label: "Revenue", key: :revenue, numeric: true },
                { label: "Status", key: :status }
              ],
              rows: [
                { sku: "SKU-001", revenue: "$12,500", status: "Active" }
              ],
              empty_state: "No records"
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, '<th scope="col" class="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-on-surface-variant)] text-right">'
    assert_includes html, '<td class="px-6 py-4 text-sm text-[color:var(--color-on-surface)] text-right">'
  end

  def test_numeric_sortable_header_keeps_right_aligned_layout
    sort_builder = ->(k, d) { "/products?sort=#{k}&direction=#{d}" }
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              sort: { key: "revenue", direction: "desc" },
              sort_path_builder: sort_builder,
              columns: [
                { label: "SKU", key: :sku },
                { label: "Revenue", key: :revenue, numeric: true, sortable: true, sort_key: "revenue" }
              ],
              rows: [
                { sku: "SKU-001", revenue: "$12,500" }
              ],
              empty_state: "No records"
            ) %>
      ERB
      formats: [:html],
      locals: { sort_builder: sort_builder }
    )

    assert_includes html, 'text-right'
    assert_includes html, 'justify-end'
  end

  def test_explicit_cell_class_overrides_numeric
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              columns: [
                { label: "SKU", key: :sku },
                { label: "Revenue", key: :revenue, numeric: true, cell_class: "font-mono" }
              ],
              rows: [
                { sku: "SKU-001", revenue: "$12,500" }
              ],
              empty_state: "No records"
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, '<td class="px-6 py-4 text-sm text-[color:var(--color-on-surface)] text-right font-mono">'
  end

  def test_ui_table_with_card_title_names_the_table
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              title: "Revenue table",
              columns: [{ label: "SKU", key: :sku }],
              rows: [{ sku: "SKU-001" }]
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'aria-label="Revenue table"'
  end

  def test_ui_table_accepts_explicit_caption
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_table(
              caption: "Quarterly revenue by SKU",
              columns: [{ label: "SKU", key: :sku }],
              rows: [{ sku: "SKU-001" }]
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, '<caption class="">Quarterly revenue by SKU</caption>'
  end
end
