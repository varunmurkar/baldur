module Baldur
  module UiHelperFeedback
    def ui_alert(body: nil, variant: :notice, title: nil, icon: nil, actions: nil, collapsible: false,
                 collapse_key: nil, collapsed_summary_action_label: 'More', class_name: nil, &block)
      content = body
      content = capture(&block) if block_given?
      storage_key = collapsible ? ui_alert_storage_key(collapse_key) : nil

      baldur_render 'baldur/components/alert',
                    variant: variant,
                    title: title,
                    icon: icon,
                    body: content,
                    actions: actions,
                    collapsible: collapsible,
                    collapse_storage_key: storage_key,
                    collapsed: collapsible && ui_alert_collapsed?(storage_key),
                    collapsed_summary_action_label: collapsed_summary_action_label,
                    class_name: class_name
    end

    def ui_snackbar_stack(snackbars: [])
      baldur_render 'baldur/components/snackbar_stack', snackbars: normalize_snackbars(snackbars)
    end

    FLASH_SNACKBAR_VARIANTS = { success: :success, notice: :notice, alert: :error, warning: :warning }.freeze

    def snackbar_flash_payloads(flash)
      FLASH_SNACKBAR_VARIANTS.filter_map do |flash_key, variant|
        payload = flash[flash_key]
        next if payload.blank?
        normalize_flash_snackbar(variant, payload)
      end
    end

    def ui_checkbox_tag(name, label: nil, description: nil, value: '1', checked: false, required: false,
                        disabled: false, id: nil, data: nil, aria: nil, form: nil, wrapper_class: nil, input_class: nil, &block)
      body = block_given? ? capture(&block) : nil
      baldur_render 'baldur/components/checkbox',
                    name: name,
                    label: label,
                    description: description,
                    value: value,
                    checked: checked,
                    required: required,
                    disabled: disabled,
                    id: id,
                    data: data,
                    aria: aria,
                    form: form,
                    wrapper_class: wrapper_class,
                    input_class: input_class,
                    body: body
    end

    private

    def normalize_snackbars(snackbars)
      Array(snackbars).filter_map do |snackbar|
        payload = normalize_snackbar_payload(snackbar)
        next if payload[:message].blank?

        payload
      end
    end

    def normalize_snackbar_payload(snackbar)
      payload = if snackbar.respond_to?(:with_indifferent_access)
                  snackbar.with_indifferent_access
                elsif snackbar.respond_to?(:to_h)
                  snackbar.to_h.with_indifferent_access
                else
                  { message: snackbar }.with_indifferent_access
                end

      {
        variant: (payload[:variant].presence || :notice).to_sym,
        title: payload[:title].presence,
        icon: payload[:icon].presence,
        dismiss_label: payload[:dismiss_label].presence,
        message: normalize_snackbar_message(payload[:message])
      }
    end

    def normalize_snackbar_message(message)
      values = Array(message).flatten.compact.map(&:to_s).map(&:strip).reject(&:blank?)
      values.to_sentence
    end

    def normalize_flash_snackbar(variant, payload)
      return { variant: variant, message: payload } if payload.is_a?(String)

      structured_payload = if payload.is_a?(Hash)
        payload
      elsif defined?(ActionController::Parameters) && payload.is_a?(ActionController::Parameters)
        payload.to_unsafe_h
      end

      return { variant: variant, message: payload } unless structured_payload

      structured_payload.symbolize_keys.reverse_merge(variant: variant)
    end

    def ui_alert_storage_key(collapse_key)
      normalized_key = collapse_key.to_s.parameterize
      return nil if normalized_key.blank?

      "baldur-alert-#{normalized_key}"
    end

    def ui_alert_collapsed?(storage_key)
      return false if storage_key.blank?

      cookies[storage_key] == 'true'
    rescue NoMethodError
      false
    end
  end
end
