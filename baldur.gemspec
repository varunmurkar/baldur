require_relative "lib/baldur/version"

Gem::Specification.new do |spec|
  spec.name        = "baldur"
  spec.version     = Baldur::VERSION
  spec.authors     = [ "Varun Murkar" ]
  spec.summary     = "Reusable Rails UI engine for same-stack application interfaces"
  spec.description = "Baldur packages reusable Rails view helpers, components, styles, and Stimulus controllers."
  spec.homepage    = "https://github.com/varunmurkar/baldur"
  spec.license     = "MIT"
  spec.metadata = {
    "source_code_uri" => "https://github.com/varunmurkar/baldur",
    "bug_tracker_uri" => "https://github.com/varunmurkar/baldur/issues",
    "changelog_uri" => "https://github.com/varunmurkar/baldur/releases",
    "rubygems_mfa_required" => "true"
  }

  spec.files = Dir.chdir(__dir__) do
    Dir[
      "{app,config,lib,script,test}/**/*",
      "README.md",
      "TODO.md",
      "LICENSE",
      "SECURITY.md",
      "baldur.gemspec",
      "Gemfile"
    ].select { |path| File.file?(path) }
  end

  spec.required_ruby_version = ">= 3.3.0"

  spec.add_dependency "importmap-rails"
  spec.add_dependency "lucide-rails"
  spec.add_dependency "rails", ">= 8.1.0"
  spec.add_dependency "tailwindcss-rails", ">= 4.4.0"
end
