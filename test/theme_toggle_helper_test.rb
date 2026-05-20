require_relative 'test_helper'
require_relative '../app/helpers/baldur/optional/auth_page_helper'

require 'action_controller'

class BaldurThemeToggleHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
    helper Baldur::RenderHelper
  end

  def test_ui_theme_toggle_renders_switch_markup
    html = TestController.render(
      inline: '<%= ui_theme_toggle %>',
      formats: [:html]
    )

    assert_includes html, 'class="switch theme-toggle"'
    assert_includes html, 'data-theme-target="toggle"'
    assert_includes html, 'data-theme-toggle'
    assert_includes html, 'aria-label="Toggle theme"'
  end

  def test_ui_theme_toggle_renders_compact_button
    html = TestController.render(
      inline: '<%= ui_theme_toggle %>',
      formats: [:html]
    )

    assert_includes html, 'data-action="click->theme#toggle"'
    assert_includes html, 'theme-toggle__compact'
  end

  def test_ui_theme_toggle_custom_aria_label
    html = TestController.render(
      inline: '<%= ui_theme_toggle(aria_label: "Switch appearance") %>',
      formats: [:html]
    )

    assert_includes html, 'aria-label="Switch appearance"'
    refute_includes html, 'aria-label="Toggle theme"'
  end

  def test_ui_theme_toggle_custom_classes
    html = TestController.render(
      inline: '<%= ui_theme_toggle(classes: "my-extra") %>',
      formats: [:html]
    )

    assert_includes html, 'my-extra'
    assert_includes html, 'switch theme-toggle'
  end

  def test_ui_theme_toggle_renders_sun_and_moon_icons
    html = TestController.render(
      inline: '<%= ui_theme_toggle %>',
      formats: [:html]
    )

    assert_includes html, 'switch__icon--sun'
    assert_includes html, 'switch__icon--moon'
    assert_includes html, 'theme-toggle__compact-icon--sun'
    assert_includes html, 'theme-toggle__compact-icon--moon'
  end
end

class BaldurAuthPageTopRailTest < Minitest::Test
  FIXTURE_VIEWS = File.expand_path('fixtures', __dir__)

  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    append_view_path FIXTURE_VIEWS
    helper Baldur::UiHelper
    helper Baldur::Optional::AuthPageHelper
  end

  def test_auth_page_without_top_rail_omits_element
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_auth_page(title: "Sign in", description: nil) do %>
          <p>Form here</p>
        <% end %>
      ERB
      formats: [:html]
    )

    refute_includes html, 'auth-page__top-rail'
  end

  def test_auth_page_with_top_rail_renders_slot
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_auth_page(title: "Sign in", description: nil, top_rail: "<span>Version 1.0</span>".html_safe) do %>
          <p>Form here</p>
        <% end %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'auth-page__top-rail'
    assert_includes html, 'Version 1.0'
  end

  def test_auth_page_top_rail_with_theme_toggle
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_auth_page(title: "Sign in", description: nil, top_rail: ui_theme_toggle) do %>
          <p>Form here</p>
        <% end %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'auth-page__top-rail'
    assert_includes html, 'data-theme-target="toggle"'
    assert_includes html, 'data-action="click->theme#toggle"'
  end
end