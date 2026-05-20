module Baldur
  module Optional
    module GoogleAuthHelper
      include Baldur::RenderHelper

      def google_sign_in_button(label: 'Sign in with Google', href: nil, block: false, **options)
        baldur_render 'baldur/optional/google_sign_in_button',
                      **{
                        label: label,
                        href: href || Baldur.config.default_google_sign_in_path,
                        block: block
                      }.merge(options)
      end
    end
  end
end
