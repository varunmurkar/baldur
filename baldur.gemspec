require_relative 'lib/baldur/version'

Gem::Specification.new do |spec|
  spec.name        = 'baldur'
  spec.version     = Baldur::VERSION
  spec.authors     = ['Varun Murkar']
  spec.summary     = 'Batteries-included Rails UI engine for the importmap, Stimulus, Tailwind stack'
  spec.description = 'Baldur helps Rails teams ship polished UI faster with install generators, reusable ui_* helpers, Tailwind components, and Stimulus wiring for apps using Propshaft, importmap-rails, stimulus-rails, and tailwindcss-rails.'
  spec.homepage    = 'https://github.com/varunmurkar/baldur'
  spec.license     = 'MIT'
  spec.metadata = {
    'source_code_uri' => 'https://github.com/varunmurkar/baldur',
    'bug_tracker_uri' => 'https://github.com/varunmurkar/baldur/issues',
    'changelog_uri' => 'https://github.com/varunmurkar/baldur/releases',
    'rubygems_mfa_required' => 'true'
  }

  spec.files = Dir.chdir(__dir__) do
    Dir[
      '{app,config,lib,script,test}/**/*',
      'README.md',
      'TODO.md',
      'LICENSE',
      'SECURITY.md',
      'baldur.gemspec',
      'Gemfile'
    ].select { |path| File.file?(path) }
  end

  spec.required_ruby_version = '>= 3.3.0'

  spec.add_dependency 'importmap-rails'
  spec.add_dependency 'lucide-rails'
  spec.add_dependency 'rails', '>= 7.0.0'
  spec.add_dependency 'tailwindcss-rails', '>= 4.3.0'
end
