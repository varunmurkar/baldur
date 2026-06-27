require_relative "test_helper"

require "action_controller"

class ShowcaseRenderSmokeTest < Minitest::Test
  CONTROLLER_MAP = {
    "showcase/home" => Showcase::HomeController,
    "showcase/components" => Showcase::ComponentsController,
    "showcase/interactions" => Showcase::InteractionsController,
    "showcase/patterns" => Showcase::PatternsController
  }.freeze

  def test_home_renders
    html = render_path("/")
    assert_includes html, "Baldur Showcase"
  end

  def test_components_index_renders
    html = render_path("/components")
    assert_includes html, "Component Inventory"
  end

  def test_all_component_pages_render
    component_ids = Showcase::ComponentsController::PARTIALS
    component_ids.each do |id|
      html = render_path("/components/#{id}")
      assert html.include?("showcase-page-header__title"), "component #{id} missing page title"
    end
  end

  def test_interactions_index_renders
    html = render_path("/interactions")
    assert_includes html, "Interaction Showcase"
  end

  def test_all_interaction_pages_render
    interaction_ids = Showcase::InteractionsController::PARTIALS
    interaction_ids.each do |id|
      html = render_path("/interactions/#{id}")
      assert html.include?("showcase-page-header__title"), "interaction #{id} missing page title"
    end
  end

  def test_patterns_index_renders
    html = render_path("/patterns")
    assert_includes html, "Pattern Gallery"
  end

  def test_all_pattern_pages_render
    pattern_ids = Showcase::PatternsController::PARTIALS
    pattern_ids.each do |id|
      html = render_path("/patterns/#{id}")
      assert html.include?("showcase-page-header__title"), "pattern #{id} missing page title"
    end
  end

  private

  def render_path(path)
    response = Showcase::Application.routes.recognize_path(path)
    controller = CONTROLLER_MAP.fetch(response[:controller])
    action = response[:action]

    request = ActionDispatch::Request.new(Rack::MockRequest.env_for(path))
    rack_response = ActionDispatch::Response.new
    _status, _headers, body = controller.dispatch(action, request, rack_response)

    html = +""
    body.each { |chunk| html << chunk }
    html
  ensure
    body.respond_to?(:close) && body.close
  end
end
