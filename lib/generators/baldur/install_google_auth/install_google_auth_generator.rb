require "rails/generators"

module Baldur
  module Generators
    class InstallGoogleAuthGenerator < Rails::Generators::Base
      def create_helper
        create_file "app/helpers/google_auth_helper.rb", <<~RUBY
          module GoogleAuthHelper
            include Baldur::Optional::GoogleAuthHelper
          end
        RUBY
      end
    end
  end
end
