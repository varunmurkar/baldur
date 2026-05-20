require 'rails/generators'

module Baldur
  module Generators
    class InstallPanelSecondaryGenerator < Rails::Generators::Base
      def create_helper
        create_file 'app/helpers/panel_secondary_helper.rb', <<~RUBY
          module PanelSecondaryHelper
            include Baldur::Optional::PanelSecondaryHelper
          end
        RUBY
      end

      def create_controller_shim
        create_file 'app/javascript/controllers/panel_secondary_controller.js', <<~JS
          export { default } from "baldur/controllers/panel_secondary_controller"
        JS
      end
    end
  end
end
