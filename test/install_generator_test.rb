require_relative "test_helper"
require_relative "../lib/generators/baldur/install/install_generator"

class BaldurInstallGeneratorTest < Rails::Generators::TestCase
  tests Baldur::Generators::InstallGenerator
  destination File.expand_path("tmp/install_generator", __dir__)
  setup :prepare_destination

  setup do
    FileUtils.mkdir_p File.join(destination_root, "app/assets/tailwind")
    File.write(File.join(destination_root, "app/assets/tailwind/application.css"), "@import \"tailwindcss\";\n")
  end

  test "installs path agnostic tailwind integration and helper shims" do
    run_generator

    tailwind_entrypoint = File.join(destination_root, "app/assets/tailwind/application.css")
    tailwind_source = File.read(tailwind_entrypoint)

    assert_includes tailwind_source, "@import \"../stylesheets/fonts.css\";"
    assert_includes tailwind_source, "@import \"../builds/tailwind/baldur.css\";"
    assert_includes tailwind_source, "@import \"../stylesheets/theme.css\";"
    refute_includes tailwind_source, "gems/baldur"

    assert_operator tailwind_source.index("@import \"../stylesheets/fonts.css\";"), :<, tailwind_source.index("@import \"tailwindcss\";")
    assert_operator tailwind_source.index("@import \"../builds/tailwind/baldur.css\";"), :<, tailwind_source.index("@import \"../stylesheets/theme.css\";")

    assert_file "app/helpers/ui_helper.rb"
    assert_file "app/helpers/ui_helper.rb", /include Baldur::Optional::AuthPageHelper/
    assert_file "config/initializers/baldur.rb"
    assert_file "app/assets/stylesheets/fonts.css"
    assert_file "app/assets/stylesheets/theme.css"
    assert_file "app/javascript/controllers/sidebar_controller.js", /export \{ default \} from "baldur\/controllers\/sidebar_controller"/
    assert_file "app/javascript/lib/snackbar.js", /export \* from "baldur\/lib\/snackbar"/
  end
end
