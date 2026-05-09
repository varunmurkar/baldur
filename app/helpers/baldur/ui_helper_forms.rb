module Baldur
  module UiHelperForms
    def ui_text_field_tag(name, value = nil, label: nil, supporting_text: nil, placeholder: nil, type: :text, required: false, disabled: false, wrapper_class: nil, input_class: nil, input_options: {}, multiline: false, prefix: nil, suffix: nil, &block)
      options = (input_options || {}).deep_dup
      input_id = options[:id].presence || "ui-text-field-#{SecureRandom.hex(3)}"
      field_classes = [ "field", "text-field", ("is-disabled" if disabled), wrapper_class ].compact.join(" ")
      control_classes = [ "text-field__control", input_class, options[:class] ].compact.join(" ")
      support_id = "#{input_id}-support"

      options[:id] = input_id
      options[:class] = control_classes
      options[:placeholder] = placeholder if placeholder.present?
      options[:required] = true if required
      options[:disabled] = true if disabled
      options[:type] = type unless multiline
      options[:name] = name
      options[:value] = value unless value.nil? || multiline
      aria = options[:aria].presence || {}
      aria[:describedby] = [ aria[:describedby], support_id ].compact.join(" ").presence
      options[:aria] = aria if aria.present?

      baldur_render "baldur/components/text_field",
             wrapper_classes: field_classes,
             label: label,
             supporting_text: supporting_text,
             input_options: options,
             input_value: multiline ? value.to_s : nil,
             multiline: multiline,
             prefix: prefix,
             suffix: suffix,
             support_id: support_id,
             supporting_slot: block_given? ? capture(&block) : nil
    end

    def ui_date_field_tag(name, value = nil, label: nil, supporting_text: nil, placeholder: "YYYY-MM-DD", required: false, disabled: false, wrapper_class: nil, input_class: nil, input_options: {}, native_input_options: {}, toggle_label: "Open date picker", icon_name: "calendar", min_date: nil, max_date: nil)
      display_options = (input_options || {}).deep_dup
      native_options = (native_input_options || {}).deep_dup
      input_id = display_options[:id].presence || "ui-date-field-#{SecureRandom.hex(3)}"
      support_id = "#{input_id}-support"
      wrapper_classes = [ "field", "date-field", wrapper_class ].compact.join(" ")

      parsed_date = case value
      when Date
                      value
      when Time, DateTime, ActiveSupport::TimeWithZone
                      value.to_date
      when String
                      begin
                        Date.iso8601(value)
                      rescue ArgumentError
                        begin
                          Date.parse(value)
                        rescue ArgumentError
                          nil
                        end
                      end
      else
                      value.respond_to?(:to_date) ? value.to_date : nil
      end
      iso_value = parsed_date&.strftime("%Y-%m-%d")
      native_id = native_options[:id].presence || "#{input_id}-native"

      display_value = if display_options.key?(:value)
                        display_options[:value]
      else
                        iso_value.presence || value.to_s.presence
      end

      display_options[:id] = input_id
      display_options[:class] = [ "text-field__control", "date-field__display", input_class, display_options[:class] ].compact.join(" ")
      display_options[:type] ||= "text"
      display_options[:name] ||= name
      display_options[:placeholder] ||= placeholder if placeholder.present?
      display_options[:required] = true if required
      display_options[:disabled] = true if disabled
      display_options[:autocomplete] ||= "off"
      display_options[:value] = display_value if display_value.present? && !display_options.key?(:value)

      display_data = (display_options[:data] || {}).dup
      display_data[:date_field_display] = true
      display_data[:date_field_target] ||= "display"
      display_data[:date_field_native_target] ||= native_id
      display_data[:field_label] ||= label if label.present?
      display_options[:data] = display_data

      aria = display_options[:aria].presence || {}
      describedby = [ aria[:describedby], support_id ].compact.join(" ").presence
      aria[:describedby] = describedby if describedby.present?
      display_options[:aria] = aria if aria.present?

      native_options[:id] = native_id
      native_options[:class] = [ "date-field__native", native_options[:class] ].compact.join(" ")
      native_options[:type] ||= "date"
      native_options.delete(:name) if native_options[:name].blank?
      native_options[:value] = iso_value if iso_value.present? && !native_options.key?(:value)
      native_options[:required] = true if required
      native_options[:disabled] = true if disabled
      native_options[:tabindex] ||= "-1"
      native_options[:autocomplete] ||= "off"
      native_options[:style] ||= "position:absolute; inset:auto; width:1px; height:1px; opacity:0; pointer-events:none;"

      if min_date.present?
        min_date_value = case min_date
        when Date, Time, DateTime, ActiveSupport::TimeWithZone
                           min_date.strftime("%Y-%m-%d")
        when String
                           min_date
        end
        native_options[:min] = min_date_value if min_date_value.present?
      end

      if max_date.present?
        max_date_value = case max_date
        when Date, Time, DateTime, ActiveSupport::TimeWithZone
                           max_date.strftime("%Y-%m-%d")
        when String
                           max_date
        end
        native_options[:max] = max_date_value if max_date_value.present?
      end

      native_data = (native_options[:data] || {}).dup
      native_data[:date_field_native] = true
      native_data[:date_field_target] ||= "native"
      native_data[:date_field_name] ||= name
      native_data[:date_field_display_target] ||= input_id
      native_options[:data] = native_data

      native_aria = native_options[:aria].presence || {}
      native_aria[:hidden] = "true"
      native_aria[:label] ||= label if label.present?
      native_options[:aria] = native_aria if native_aria.present?

      baldur_render "baldur/components/date_field",
             wrapper_classes: wrapper_classes,
             label: label,
             supporting_text: supporting_text,
             display_input_options: display_options,
             native_input_options: native_options,
             toggle_label: toggle_label,
             icon_name: icon_name,
             support_id: support_id
    end

    def ui_mobile_field_tag(name, value = nil, label: "Mobile", placeholder: "10-digit mobile number", country_code: "+91", required: false, disabled: false, wrapper_class: nil, input_class: nil, input_options: {})
      normalized_value = value.to_s.gsub(/\D+/, "").slice(0, 10)
      merged_input_options = (input_options || {}).deep_dup
      merged_input_options[:data] = (merged_input_options[:data] || {}).merge(
        mobile_input: true,
        mobile_country_code: country_code
      )
      merged_input_options[:inputmode] ||= "numeric"
      merged_input_options[:pattern] ||= "\\d*"
      merged_input_options[:autocomplete] ||= "tel"
      merged_wrapper_class = [ wrapper_class, "field--mobile" ].compact.join(" ")

      ui_text_field_tag(
        name,
        normalized_value,
        label: label,
        placeholder: placeholder,
        type: :tel,
        required: required,
        disabled: disabled,
        wrapper_class: merged_wrapper_class,
        input_class: input_class,
        input_options: merged_input_options,
        prefix: country_code
      )
    end

    def ui_menu_select_tag(name, options:, selected: nil, placeholder: "Select an option", label: nil, supporting_text: nil, wrapper_class: nil, data: nil, input_data: nil, disabled: false)
      normalized = options.map do |option|
        case option
        when Hash
          option.symbolize_keys
        when Array
          value, label_text, meta = option
          details = meta.is_a?(Hash) ? meta.symbolize_keys : {}
          { value: value, label: label_text }.merge(details)
        else
          { value: option, label: option }
        end
      end

      normalized.each do |option|
        option[:value] = option[:value].to_s
        option[:label] = option[:label].to_s
        option[:disabled] = !!option[:disabled] if option.key?(:disabled)
        option[:disabled] ||= option[:available] == false if option.key?(:available)
        option[:badge] = option[:badge].to_s if option[:badge]
        option[:badge_variant] = option[:badge_variant].to_sym if option[:badge_variant]
        option[:badge_size] = option[:badge_size].to_sym if option[:badge_size]
        option[:support] = option[:support].to_s if option[:support]
        option[:description] = option[:description].to_s if option[:description]
      end

      selected_value = selected.present? ? selected.to_s : nil
      selected_option = normalized.find { |opt| opt[:value] == selected_value } if selected_value
      unless selected_option || placeholder.present?
        selected_option = normalized.find { |opt| !opt[:disabled] }
        selected_value = selected_option&.dig(:value)
      end
      button_label = selected_option&.dig(:label) || placeholder

      field_id = "ui-menu-select-#{SecureRandom.hex(4)}"
      auto_width_class = menu_select_explicit_width?(wrapper_class) ? nil : "field--select-auto"
      wrapper_classes = [ "field", "field--select", auto_width_class, wrapper_class ].compact.join(" ")

      baldur_render "baldur/components/menu_select",
             name: name,
             field_id: field_id,
             wrapper_classes: wrapper_classes,
             wrapper_data: data,
             label: label,
             supporting_text: supporting_text,
             selected_value: selected_value,
             button_label: button_label,
             options: normalized,
             input_data: input_data,
             disabled: disabled
    end

    private

    def menu_select_explicit_width?(wrapper_class)
      wrapper_class.to_s.match?(/(^|\s)(?:[a-z0-9_-]+:)*(?:w|min-w|max-w)-\S+/)
    end
  end
end
