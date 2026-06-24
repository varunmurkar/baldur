require_relative 'test_helper'

require 'action_controller'

class BaldurTextFieldHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_ui_text_field_tag_passes_html5_input_attributes_through_input_options
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_text_field_tag(
              :price,
              12.5,
              label: "Price",
              type: :number,
              input_options: {
                step: :any,
                min: 0,
                max: 100,
                inputmode: "decimal",
                autocomplete: "off"
              }
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'type="number"'
    assert_includes html, 'name="price"'
    assert_includes html, 'value="12.5"'
    assert_includes html, 'step="any"'
    assert_includes html, 'min="0"'
    assert_includes html, 'max="100"'
    assert_includes html, 'inputmode="decimal"'
    assert_includes html, 'autocomplete="off"'
  end
end
