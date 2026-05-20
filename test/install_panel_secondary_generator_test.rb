require_relative 'test_helper'
require_relative '../lib/generators/baldur/install_panel_secondary/install_panel_secondary_generator'

class BaldurInstallPanelSecondaryGeneratorTest < Rails::Generators::TestCase
  tests Baldur::Generators::InstallPanelSecondaryGenerator
  destination File.expand_path('tmp/install_panel_secondary_generator', __dir__)
  setup :prepare_destination

  setup do
    FileUtils.mkdir_p File.join(destination_root, 'app/assets/tailwind')
    File.write(File.join(destination_root, 'app/assets/tailwind/application.css'),
               "@import \"tailwindcss\";\n@import \"../builds/tailwind/baldur.css\";\n")
  end

  test 'adds helper and controller without touching the tailwind contract' do
    run_generator

    assert_file 'app/helpers/panel_secondary_helper.rb', /include Baldur::Optional::PanelSecondaryHelper/
    assert_file 'app/javascript/controllers/panel_secondary_controller.js',
                %r{export \{ default \} from "baldur/controllers/panel_secondary_controller"}
    assert_equal "@import \"tailwindcss\";\n@import \"../builds/tailwind/baldur.css\";\n",
                 File.read(File.join(destination_root, 'app/assets/tailwind/application.css'))
  end
end
