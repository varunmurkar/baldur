require_relative "test_helper"

require "action_controller"

class BaldurCspRenderingTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path("../app/views", __dir__)
    helper Baldur::UiHelper
    helper Baldur::UiHelperForms
  end

  def test_tooltip_renders_without_inline_style_attribute
    html = TestController.render(
      partial: "baldur/components/tooltip",
      locals: {
        text: "Info",
        content: "Tooltip body",
        show_icon: true,
        icon: "circle-help",
        variant: :link,
        wrapper_class: nil,
        trigger_class: nil,
        bubble_class: nil,
        inline: false
      }
    )

    refute_includes html, 'style="text-align: left;"'
    assert_includes html, 'role="tooltip"'
  end

  def test_date_field_renders_hidden_native_input_class_without_inline_style
    html = TestController.render(
      partial: "baldur/components/date_field",
      locals: {
        wrapper_classes: "field date-field",
        label: "Due date",
        supporting_text: nil,
        display_input_options: {
          id: "due-date-display",
          class: "text-field__control date-field__display",
          type: "text",
          name: "due_date"
        },
        native_input_options: {
          id: "due-date-native",
          class: "date-field__native date-field__native--hidden",
          type: "date",
          tabindex: "-1"
        },
        toggle_label: "Open date picker",
        icon_name: "calendar",
        support_id: "due-date-support"
      }
    )

    refute_includes html, 'style="position:absolute;'
    assert_includes html, 'date-field__native--hidden'
  end
end
