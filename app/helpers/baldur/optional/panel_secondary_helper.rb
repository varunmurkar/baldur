module Baldur
  module Optional
    module PanelSecondaryHelper
      include Baldur::RenderHelper

      def ui_panel_secondary(id:, title:, trigger_label:, trigger_icon: 'message-square', panel_class: nil,
                             trigger_class: nil, shell_class: nil, shell_data: nil, panel_data: nil, trigger_data: nil, &block)
        baldur_render 'baldur/optional/panel_secondary',
                      id: id,
                      title: title,
                      trigger_label: trigger_label,
                      trigger_icon: trigger_icon,
                      panel_class: panel_class,
                      trigger_class: trigger_class,
                      shell_class: shell_class,
                      shell_data: shell_data,
                      panel_data: panel_data,
                      trigger_data: trigger_data,
                      body: block_given? ? capture(&block) : nil
      end

      def ui_panel_right(**options, &block)
        ui_panel_secondary(**options, &block)
      end
    end
  end
end
