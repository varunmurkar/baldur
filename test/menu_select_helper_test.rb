require_relative 'test_helper'

require 'action_controller'

class BaldurMenuSelectHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_ui_menu_select_tag_renders_listbox_aria_wiring
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_menu_select_tag(
              :status,
              options: [
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" }
              ],
              selected: "active",
              label: "Status"
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'role="listbox"'
    assert_includes html, 'aria-haspopup="listbox"'
    assert_includes html, 'aria-expanded="false"'
    assert_includes html, 'aria-controls="'
    assert_includes html, 'aria-labelledby="'
    assert_includes html, 'role="option"'
    assert_includes html, 'aria-selected="true"'
    assert_includes html, 'aria-selected="false"'
    assert_includes html, 'hidden'
    refute_includes html, 'role="menu"'
    refute_includes html, 'role="menuitemradio"'
    refute_includes html, 'aria-checked'
  end

  def test_ui_menu_select_tag_gives_options_unique_ids
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_menu_select_tag(
              :status,
              options: [
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" }
              ],
              selected: "active"
            ) %>
      ERB
      formats: [:html]
    )

    option_ids = html.scan(/id="([^"]*-option-[^"]*)"/).flatten
    assert_equal 2, option_ids.size
    assert_equal option_ids.uniq.size, option_ids.size
  end

  def test_ui_menu_select_tag_marks_selected_option_active_and_selected
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_menu_select_tag(
              :status,
              options: [
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" }
              ],
              selected: "archived"
            ) %>
      ERB
      formats: [:html]
    )

    archived_option = html[/<div[^>]*data-value="archived"[^>]*>/]
    assert archived_option, 'archived option should be present'
    assert_includes archived_option, 'is-selected'
    assert_includes archived_option, 'is-active'
    assert_includes archived_option, 'aria-selected="true"'

    active_option = html[/<div[^>]*data-value="active"[^>]*>/]
    assert active_option, 'active option should be present'
    refute_includes active_option, 'is-selected'
    refute_includes active_option, 'is-active'
    assert_includes active_option, 'aria-selected="false"'
  end

  def test_ui_menu_select_tag_disabled_option_gets_aria_disabled
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_menu_select_tag(
              :status,
              options: [
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived", disabled: true }
              ],
              selected: "active"
            ) %>
      ERB
      formats: [:html]
    )

    archived_option = html[/<div[^>]*data-value="archived"[^>]*>/]
    assert_includes archived_option, 'aria-disabled="true"'
    assert_includes archived_option, 'is-disabled'
  end

  def test_ui_menu_select_tag_disabled_trigger_gets_aria_disabled_and_disabled_attr
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_menu_select_tag(
              :status,
              options: [{ value: "active", label: "Active" }],
              disabled: true
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'aria-disabled="true"'
    assert_includes html, 'disabled'
    # The trigger itself must show aria-disabled="true" when disabled.
    # We verify that the trigger opening tag has the correct aria-disabled value.
    trigger_open = html[/<button[^>]*aria-disabled="true"[^>]*>/]
    assert trigger_open, 'trigger should have aria-disabled=true'
  end
end
