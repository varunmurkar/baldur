require "securerandom"

module Baldur
  module UiHelper
    include Baldur::RenderHelper
    include Baldur::UiHelperFeedback
    include Baldur::UiHelperSidebar
    include Baldur::UiHelperUnavailable
    include Baldur::UiHelperForms

    def ui_icon(name, class_name: nil)
      normalized_name = name.to_s.tr("_", "-")
      svg_options = LucideRails.default_options.merge("class" => class_name, "aria-hidden" => "true")

      content_tag(:svg, LucideRails::IconProvider.icon(normalized_name).html_safe, svg_options)
    end

    def ui_button(**options)
      baldur_render "baldur/components/button", **options
    end

    def ui_action_row(primary_button:, secondary_button: nil, extra_buttons: [], classes: nil)
      buttons = []
      buttons << secondary_button if secondary_button.present?
      buttons.concat(Array(extra_buttons).compact)
      buttons << primary_button if primary_button.present?

      baldur_render "baldur/components/action_row", buttons: buttons, class: classes
    end

    def ui_card(title:, description: nil, badge: nil, icon: nil, actions: nil, variant: :default, classes: nil, body_class: nil, body: nil, &block)
      body_content = body
      body_content = capture(&block) if block_given?
      baldur_render "baldur/components/card",
             title: title,
             description: description,
             badge: badge,
             icon: icon,
             actions: actions,
             variant: variant,
             class: classes,
             body_class: body_class,
             body: body_content
    end

    def ui_table(columns:, rows:, empty_state: "No records yet", **options)
      card_options = options.slice(:title, :title_meta, :description, :actions, :controls, :controls_position, :footer, :classes)
      table_options = options.except(:title, :title_meta, :description, :actions, :controls, :controls_position, :footer, :classes)
      table_markup = baldur_render "baldur/components/table",
             **{
               columns: columns,
               rows: rows,
               empty_state: empty_state
             }.merge(table_options)
      return table_markup if card_options.values.all?(&:blank?)

      ui_table_card(**card_options, body: table_markup)
    end

    def ui_table_card(title: nil, title_meta: nil, description: nil, actions: nil, controls: nil, controls_position: :row, footer: nil, classes: nil, body: nil, &block)
      body_content = body
      body_content = capture(&block) if block_given?
      baldur_render "baldur/components/table_card",
             title: title,
             title_meta: title_meta,
             description: description,
             actions: actions,
             controls: controls,
             controls_position: controls_position,
             footer: footer,
             class: classes,
             body: body_content
    end

    def ui_chart_card(title: nil, description: nil, actions: nil, footer: nil, classes: nil, body: nil, &block)
      body_content = body
      body_content = capture(&block) if block_given?
      baldur_render "baldur/components/chart_card",
             title: title,
             description: description,
             actions: actions,
             footer: footer,
             class: classes,
             body: body_content
    end

    def ui_table_footer(current_page:, total_pages:, path_builder:, total_count: nil, per_page: nil, rows_per_page_param: nil, rows_per_page_options: [], rows_per_page_selected: nil)
      baldur_render "baldur/components/table_footer",
             current_page: current_page.to_i,
             total_pages: total_pages.to_i,
             total_count: total_count,
             per_page: per_page,
             rows_per_page_param: rows_per_page_param,
             rows_per_page_options: Array(rows_per_page_options),
             rows_per_page_selected: rows_per_page_selected,
             path_builder: path_builder
    end

    def ui_table_truncated_text(text, class_name: "block truncate", title: nil)
      value = text.to_s.strip
      return "—" if value.blank?

      content_tag(:span, value, class: class_name, title: (title.presence || value))
    end

    def ui_expandable_table_list(items)
      values = Array(items).compact.map(&:to_s).map(&:strip).reject(&:blank?)
      return "—" if values.empty?

      summary = values.join(", ")
      return ui_table_truncated_text(summary) if values.size <= 2

      content_tag(:div, class: "table-disclosure", data: { controller: "table-disclosure" }) do
        safe_join(
          [
            content_tag(
              :button,
              type: "button",
              class: "table-disclosure__trigger",
              aria: { expanded: "false" },
              data: {
                action: "click->table-disclosure#toggle",
                table_disclosure_target: "trigger"
              }
            ) do
              safe_join(
                [
                  content_tag(:span, "#{values.size} items", class: "table-disclosure__summary", title: summary),
                  content_tag(:span, "Expand", class: "table-disclosure__toggle table-disclosure__toggle--collapsed"),
                  content_tag(:span, "Collapse", class: "table-disclosure__toggle table-disclosure__toggle--expanded")
                ]
              )
            end,
            content_tag(:div, class: "table-disclosure__content", data: { table_disclosure_target: "content" }) do
              safe_join(values.map { |value| content_tag(:div, value, class: "table-disclosure__content-item") })
            end
          ]
        )
      end
    end

    def ui_pagination(current_page:, total_pages:, path_builder:, total_count: nil, per_page: nil, window: 2, rows_per_page_param: nil, rows_per_page_options: [], rows_per_page_selected: nil)
      baldur_render "baldur/components/pagination",
             current_page: current_page.to_i,
             total_pages: total_pages.to_i,
             total_count: total_count,
             per_page: per_page,
             rows_per_page_param: rows_per_page_param,
             rows_per_page_options: Array(rows_per_page_options),
             rows_per_page_selected: rows_per_page_selected,
             path_builder: path_builder,
             pages: ui_pagination_pages(current_page: current_page.to_i, total_pages: total_pages.to_i, window: window.to_i)
    end

    def ui_modal(id:, title:, description: nil, submit_label: "Continue", close_label: "Cancel", **options, &block)
      body = block_given? ? capture(&block) : nil
      baldur_render "baldur/components/modal",
             **{
               id: id,
               title: title,
               description: description,
               submit_label: submit_label,
               close_label: close_label,
               body: body
             }.merge(options)
    end

    def ui_modal_host(id:, classes: nil, &block)
      body = block_given? ? capture(&block) : nil
      baldur_render "baldur/components/modal_host",
             id: id,
             classes: classes,
             body: body
    end

    def ui_confirmation_modal(host_id:, dialog_id:, title:, description: nil, tone: :default, confirm_label: "Confirm", cancel_label: "Cancel", confirm_button_options: {}, cancel_button_options: {}, type_to_confirm: nil, body: nil, &block)
      body = block_given? ? capture(&block) : body
      type_to_confirm = nil unless type_to_confirm.is_a?(Hash)
      baldur_render "baldur/components/confirmation_modal",
             host_id: host_id,
             dialog_id: dialog_id,
             title: title,
             description: description,
             tone: tone,
             confirm_label: confirm_label,
             cancel_label: cancel_label,
             confirm_button_options: confirm_button_options,
             cancel_button_options: cancel_button_options,
             type_to_confirm: type_to_confirm,
             body: body
    end

    def ui_badge(text:, variant: :default, size: :sm, html_options: {})
      baldur_render "baldur/components/badge", text: text, variant: variant, size: size, html_options: html_options
    end

    def ui_kpi(id: nil, label:, value:, caption: nil, trend: nil, variant: :default, caption_icon: nil, action: nil)
      baldur_render "baldur/components/kpi",
             id: id,
             label: label,
             value: value,
             caption: caption,
             trend: trend,
             variant: variant,
             caption_icon: caption_icon,
             action: action
    end

    def ui_segmented_buttons(items:, aria_label: "Tabs", classes: nil)
      baldur_render "baldur/components/segmented_buttons", items: items, aria_label: aria_label, classes: classes
    end

    def ui_tooltip(text:, content:, show_icon: true, icon: "circle-help", variant: :link, wrapper_class: nil, trigger_class: nil, bubble_class: nil, inline: false)
      baldur_render "baldur/components/tooltip",
             text: text,
             content: content,
             show_icon: show_icon,
             icon: icon,
             variant: variant,
             wrapper_class: wrapper_class,
             trigger_class: trigger_class,
             bubble_class: bubble_class,
             inline: inline
    end

    def ui_pagination_pages(current_page:, total_pages:, window:)
      return [] if total_pages <= 1

      raw_pages = [ 1 ]
      raw_pages.concat(((current_page - window)..(current_page + window)).to_a)
      raw_pages << total_pages
      normalized = raw_pages.select { |page| page.between?(1, total_pages) }.uniq.sort

      pages = []
      normalized.each_with_index do |page, index|
        pages << page
        next_page = normalized[index + 1]
        pages << :gap if next_page && next_page - page > 1
      end
      pages
    end
  end
end
