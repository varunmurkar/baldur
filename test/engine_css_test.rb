require_relative 'test_helper'

class EngineCssTest < Minitest::Test
  def engine_css_path
    Baldur::Engine.root.join('app/assets/tailwind/baldur/engine.css')
  end

  def test_engine_css_exists
    assert engine_css_path.exist?, "engine.css missing at #{engine_css_path}"
  end

  def test_source_paths_resolve_to_app_helpers_and_views
    skip('engine.css not found') unless engine_css_path.exist?

    source = engine_css_path.read

    ['helpers', 'views'].each do |dir|
      assert_includes source, "@source \"../../../#{dir}\"",
                      "engine.css @source for #{dir} must resolve from app/assets/tailwind/baldur/ → app/#{dir}\n" \
                      "Expected: @source \"../../../#{dir}\"\n" \
                      "Got: check #{engine_css_path}"
    end
  end

  def test_source_paths_do_not_use_shallow_relative
    skip('engine.css not found') unless engine_css_path.exist?

    source = engine_css_path.read

    ['helpers', 'views'].each do |dir|
      refute_includes source, "@source \"../../#{dir}\"",
                      "engine.css uses shallow @source \"../../#{dir}\" which resolves to app/assets/tailwind/#{dir} (nonexistent)\n" \
                      "Must use \"../../../#{dir}\" to reach app/#{dir}"
    end
  end
end
