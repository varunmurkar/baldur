require_relative 'test_helper'

class BaldurGemspecTest < Minitest::Test
  def test_gemspec_lists_only_files
    spec = Gem::Specification.load(File.expand_path('../baldur.gemspec', __dir__))

    assert spec.files.any?, 'expected gemspec to include files'
    assert spec.files.all? { |path|
      File.file?(File.expand_path("../#{path}", __dir__))
    }, 'expected spec.files to contain only files'
    assert_includes spec.files, 'app/assets/tailwind/baldur/engine.css'
  end
end
