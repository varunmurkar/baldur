require_relative 'test_helper'

require 'action_controller'

class BaldurSidebarHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
    helper Baldur::UiHelperSidebar
  end

  def setup
    @original_brand = Baldur.config.marketing_brand
    Baldur.config.marketing_brand = {
      name: 'Acme',
      wordmark: 'Acme Ops',
      logo_src: '/acme.svg',
      logo_alt: 'Acme logo'
    }
  end

  def teardown
    Baldur.config.marketing_brand = @original_brand
  end

  def test_sidebar_uses_configured_brand_and_mirrors_links_for_mobile
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_sidebar(
              brand_path: "/home",
              primary_links: [{ name: "Dashboard", path: "/dashboard", icon: "layout-dashboard", active: true }],
              secondary_links: [{ name: "Settings", path: "/settings", icon: "settings", active: false }],
              secondary_label: "Admin"
            ) %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'data-controller="sidebar"'
    assert_includes html, 'data-controller="mobile-sidebar"'
    assert_includes html, 'Acme Ops'
    assert_includes html, 'href="/dashboard"'
    assert_includes html, 'href="/settings"'
    assert_includes html, 'aria-current="page"'
    assert_includes html, 'Admin'
    assert_includes html, 'aria-controls="mobile-sidebar"'
    assert_includes html, 'aria-expanded="false"'
    assert_includes html, 'role="dialog"'
    assert_includes html, 'aria-modal="true"'
    assert_includes html, 'aria-label="Navigation menu"'
  end

  def test_sidebar_renders_slot_content_and_mobile_fallbacks
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_sidebar(primary_links: [{ name: "Dashboard", path: "/dashboard" }]) do |sidebar| %>
          <% sidebar.with_header do %>
            <div class="tenant-switcher">Tenant Switcher</div>
          <% end %>
          <% sidebar.with_footer do %>
            <div class="user-menu">Sign out</div>
          <% end %>
        <% end %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'Tenant Switcher'
    assert_includes html, 'user-menu'
    assert_includes html, 'Sign out'
    assert_operator html.scan('Tenant Switcher').size, :>=, 2
    assert_operator html.scan('Sign out').size, :>=, 2
  end
end
