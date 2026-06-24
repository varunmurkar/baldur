require_relative 'test_helper'

require 'action_controller'

class BaldurSegmentedButtonsHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_ui_segmented_buttons_renders_wrapper_and_tab_aria_wiring
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_segmented_buttons(
              id: "catalog-tabs",
              aria_label: "Catalog tabs",
              data: { controller: "segmented-tabs" },
              items: [
                {
                  id: "catalog-tab-overview",
                  label: "Overview",
                  value: "overview",
                  selected: true,
                  aria: { controls: "catalog-panel-overview" },
                  data: { segmented_tabs_target: "tab", tab_value: "overview" }
                },
                {
                  id: "catalog-tab-settings",
                  label: "Settings",
                  value: "settings",
                  aria: { controls: "catalog-panel-settings" },
                  data: { segmented_tabs_target: "tab", tab_value: "settings" }
                }
              ]
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'id="catalog-tabs"'
    assert_includes html, 'role="tablist"'
    assert_includes html, 'aria-label="Catalog tabs"'
    assert_includes html, 'data-controller="segmented-tabs"'
    assert_includes html, 'id="catalog-tab-overview"'
    assert_includes html, 'aria-controls="catalog-panel-overview"'
    assert_includes html, 'aria-selected="true"'
    assert_includes html, 'data-segmented-tabs-target="tab"'
    assert_includes html, 'data-tab-value="overview"'
  end

  def test_ui_segmented_buttons_keeps_unselected_tabs_focusable_only_via_roving_tabindex
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_segmented_buttons(
              items: [
                { label: "First", value: "first", selected: true },
                { label: "Second", value: "second" }
              ]
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'tabindex="0"'
    assert_includes html, 'tabindex="-1"'
  end
end
