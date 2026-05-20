require 'rails/generators'

module Baldur
  module Generators
    class InstallGenerator < Rails::Generators::Base
      source_root File.expand_path('templates', __dir__)

      CORE_CONTROLLERS = %w[
        accordion
        confirmation
        date_field
        details_menu
        form_submit
        menu_select
        modal
        marketing_pricing
        marketing_tabs
        mobile_sidebar
        segmented_tabs
        sidebar
        smooth_scroll
        snackbar
        theme
        tooltip
      ].freeze

      CORE_LIBS = %w[
        animation-helpers
        dom-helpers
        field-validation-helpers
        focus-management
        formatting-helpers
        snackbar
        storage-helpers
      ].freeze

      def create_ui_helper
        template 'ui_helper.rb', 'app/helpers/ui_helper.rb'
      end

      def create_initializer
        template 'baldur_initializer.rb', 'config/initializers/baldur.rb'
      end

      def create_theme_override
        template 'theme.css', 'app/assets/stylesheets/theme.css'
      end

      def create_fonts_override
        template 'fonts.css', 'app/assets/stylesheets/fonts.css'
      end

      def create_controller_shims
        CORE_CONTROLLERS.each do |name|
          create_file "app/javascript/controllers/#{name}_controller.js", <<~JS
            export { default } from "baldur/controllers/#{name}_controller"
          JS
        end
      end

      def create_lib_shims
        CORE_LIBS.each do |name|
          create_file "app/javascript/lib/#{name}.js", <<~JS
            export * from "baldur/lib/#{name}"
          JS
        end
      end

      def add_stylesheet_import
        return unless File.exist?(tailwind_entrypoint_path)

        append_unique_line tailwind_entrypoint_path, '@import "../stylesheets/fonts.css";'
        append_unique_line tailwind_entrypoint_path, '@import "../builds/tailwind/baldur.css";'
        append_unique_line tailwind_entrypoint_path, '@import "../stylesheets/theme.css";'
        ensure_stylesheet_import_order
      end

      private

      def append_unique_line(path, line)
        append_to_file path, "#{line}\n" unless File.read(path).include?(line)
      end

      def ensure_stylesheet_import_order
        source = File.read(tailwind_entrypoint_path)
        fonts_import = '@import "../stylesheets/fonts.css";'
        tailwind_import = '@import "tailwindcss";'
        baldur_import = '@import "../builds/tailwind/baldur.css";'
        theme_import = '@import "../stylesheets/theme.css";'
        normalized = source.lines.reject { |line| line.strip == fonts_import }.join
        normalized = if normalized.include?(tailwind_import)
                       normalized.sub("#{tailwind_import}\n", "#{fonts_import}\n#{tailwind_import}\n")
                     else
                       "#{fonts_import}\n#{normalized}"
                     end

        if normalized.include?(baldur_import) && normalized.include?(theme_import) &&
           normalized.index(baldur_import) > normalized.index(theme_import)
          normalized = normalized.lines.reject { |line| line.strip == theme_import }.join
          normalized = normalized.sub("#{baldur_import}\n", "#{baldur_import}\n#{theme_import}\n")
        end

        File.write(tailwind_entrypoint_path, normalized)
      end

      def tailwind_entrypoint_path
        File.join(destination_root, tailwind_entrypoint)
      end

      def tailwind_entrypoint
        'app/assets/tailwind/application.css'
      end
    end
  end
end
