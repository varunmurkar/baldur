module Baldur
  module UiHelperUnavailable
    def ui_unavailable_metric(reason: nil, dependencies: nil, warning_keys: nil, text: 'Not available',
                              text_class: 'text-xs text-muted')
      content_tag(:span, class: 'inline-flex items-center gap-1 whitespace-nowrap align-middle') do
        safe_join(
          [
            content_tag(:span, text, class: text_class),
            ui_tooltip(
              text: 'Why unavailable',
              content: ui_unavailable_explanation_content(reason: reason, dependencies: dependencies,
                                                          warning_keys: warning_keys),
              icon: 'info',
              variant: :icon,
              inline: true
            )
          ]
        )
      end
    end

    def ui_unavailable_explanation_content(reason:, dependencies:, warning_keys: nil)
      resolved_dependencies = ui_unavailable_dependencies(dependencies: dependencies, warning_keys: warning_keys)
      groups = ui_unavailable_dependency_groups(resolved_dependencies)
      return ui_unavailable_explanation_sections(reason: reason, groups: groups) if reason.present? || groups.present?

      Baldur.config.unavailable_fallback_message
    end

    def ui_unavailable_dependencies(dependencies:, warning_keys: nil)
      explicit_dependencies = Array(dependencies).compact
      return explicit_dependencies if explicit_dependencies.present?

      Array(Baldur.config.warning_dependency_resolver.call(warning_keys))
    end

    def ui_unavailable_dependency_groups(dependencies)
      grouped = {}
      order = []

      Array(dependencies).each do |dependency|
        dep = dependency.respond_to?(:with_indifferent_access) ? dependency.with_indifferent_access : dependency
        dataset_key = dep[:dataset_key]
        field_key = dep[:field_key]
        snapshot_metric = dep[:snapshot_metric]
        next if dataset_key.blank? && field_key.blank? && snapshot_metric.blank?

        group_key = dataset_key.presence || '__no_dataset__'
        unless grouped.key?(group_key)
          grouped[group_key] = {
            dataset_key: dataset_key.presence,
            fields: [],
            metrics: []
          }
          order << group_key
        end

        group = grouped[group_key]
        group[:fields] << field_key if field_key.present? && !group[:fields].include?(field_key)
        group[:metrics] << snapshot_metric if snapshot_metric.present? && !group[:metrics].include?(snapshot_metric)
      end

      order.filter_map do |group_key|
        group = grouped[group_key]
        details = []
        details << group[:fields].join(', ') if group[:fields].present?
        details << "snapshot metric: #{group[:metrics].join(', ')}" if group[:metrics].present?
        next if group[:dataset_key].blank? && details.blank?

        {
          dataset_label: (ui_dependency_dataset_name(group[:dataset_key]) if group[:dataset_key].present?),
          details: details.join(' | ')
        }
      end
    end

    def ui_unavailable_dependency_group_content(groups)
      lines = groups.map do |group|
        line = if group[:dataset_label].present? && group[:details].present?
                 "• #{group[:dataset_label]} › #{group[:details]}"
               else
                 "• #{group[:dataset_label].presence || group[:details]}"
               end
        content_tag(:span, line, class: 'block text-left')
      end
      safe_join([content_tag(:span, 'Upload/refresh:', class: 'block text-left'), *lines])
    end

    def ui_unavailable_explanation_sections(reason:, groups:)
      parts = []
      parts << content_tag(:span, reason, class: 'block text-left') if reason.present?
      parts << ui_unavailable_dependency_group_content(groups) if groups.present?
      safe_join(parts)
    end

    def ui_dependency_dataset_name(dataset_key)
      Baldur.config.dependency_dataset_name_resolver.call(dataset_key)
    end
  end
end
