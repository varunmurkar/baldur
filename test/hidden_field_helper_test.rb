require_relative 'test_helper'

require 'action_controller'

class BaldurHiddenFieldHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_ui_hidden_field_tag_renders_rails_hidden_field_markup
    html = TestController.render(
      inline: '<%= ui_hidden_field_tag(:planner_tab, "targets", data: { planner_tabs_target: "hiddenInput" }) %>',
      formats: [:html]
    )

    assert_includes html, 'type="hidden"'
    assert_includes html, 'name="planner_tab"'
    assert_includes html, 'id="planner_tab"'
    assert_includes html, 'value="targets"'
    assert_includes html, 'data-planner-tabs-target="hiddenInput"'
  end
end
