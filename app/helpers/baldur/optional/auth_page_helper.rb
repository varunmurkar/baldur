module Baldur
  module Optional
    module AuthPageHelper
      include Baldur::RenderHelper

      def ui_auth_page(title:, description:, brand_path: nil, shell_class: nil, card_class: nil,
                       top_rail: nil, notice: nil, alert: nil, &block)
        baldur_render 'baldur/optional/auth_page',
                      title: title,
                      description: description,
                      brand_path: brand_path,
                      shell_class: shell_class,
                      card_class: card_class,
                      top_rail: top_rail,
                      notice: notice,
                      alert: alert,
                      body: block_given? ? capture(&block) : nil
      end
    end
  end
end
