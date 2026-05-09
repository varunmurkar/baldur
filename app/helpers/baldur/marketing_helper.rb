module Baldur
  module MarketingHelper
    include Baldur::RenderHelper

    def ui_marketing_top_nav(links:, primary_action:, theme_toggle: nil, classes: nil, brand: {})
      baldur_render "baldur/marketing/top_nav",
             links: Array(links),
             primary_action: primary_action,
             theme_toggle: theme_toggle,
             classes: classes,
             brand: ui_marketing_resolve_brand(brand)
    end

    def ui_marketing_hero_section(variant:, headline:, body:, primary_action:, centerpiece_image:, id: "hero", secondary_action: nil, supporting_action: nil, callouts: [], orbit_sources: [], classes: nil)
      baldur_render "baldur/marketing/hero_section",
             variant: variant,
             headline: headline,
             body: body,
             primary_action: primary_action,
             secondary_action: secondary_action,
             supporting_action: supporting_action,
             callouts: Array(callouts),
             orbit_sources: Array(orbit_sources),
             centerpiece_image: centerpiece_image,
             id: id,
             classes: classes
    end

    def ui_marketing_features_section(title:, tabs:, id: "use-cases", description: nil, cta: nil, question_label: "Answers to questions like:", classes: nil)
      baldur_render "baldur/marketing/features_section",
             title: title,
             description: description,
             tabs: Array(tabs),
             cta: cta,
             question_label: question_label,
             id: id,
             classes: classes
    end

    def ui_marketing_testimonials_section(variant:, title:, items:, id: "proof", classes: nil)
      baldur_render "baldur/marketing/testimonials_section",
             variant: variant,
             title: title,
             items: Array(items),
             id: id,
             classes: classes
    end

    def ui_marketing_faq_section(title:, items:, id: "faq", description: nil, classes: nil, container_class: nil)
      baldur_render "baldur/marketing/faq_section",
             title: title,
             description: description,
             items: Array(items),
             id: id,
             classes: classes,
             container_class: container_class
    end

    def ui_marketing_cta_banner(banner:, classes: nil)
      baldur_render "baldur/marketing/cta_banner", banner: banner, classes: classes
    end

    def ui_marketing_pricing_tables(headline:, subheadline:, billing_options:, plans:, shared_capabilities:, eyebrow: "Pricing", fair_use_link: nil, classes: nil)
      baldur_render "baldur/marketing/pricing_tables",
             headline: headline,
             subheadline: subheadline,
             billing_options: Array(billing_options),
             plans: Array(plans),
             shared_capabilities: shared_capabilities,
             eyebrow: eyebrow,
             fair_use_link: fair_use_link,
             classes: classes
    end

    def ui_marketing_footer(columns:, description:, copyright: nil, classes: nil, brand: {})
      baldur_render "baldur/marketing/footer",
             columns: Array(columns),
             description: description,
             copyright: copyright,
             classes: classes,
             brand: ui_marketing_resolve_brand(brand)
    end

    def ui_marketing_render_content(content)
      if content.respond_to?(:call)
        capture(&content)
      else
        content
      end
    end

    def ui_marketing_action_string(*actions)
      actions.flatten.compact.map(&:to_s).map(&:strip).reject(&:blank?).uniq.join(" ")
    end

    def ui_marketing_resolve_brand(overrides = {})
      configured_brand = ui_marketing_configured_brand
      override_brand = overrides.to_h.symbolize_keys
      resolved_brand = configured_brand.merge(override_brand)
      resolved_name = resolved_brand[:name].presence || "Brand"

      resolved_brand[:name] = resolved_name
      resolved_brand[:wordmark] = resolved_brand[:wordmark].presence || resolved_name
      resolved_brand[:logo_src] = resolved_brand[:logo_src].presence || "/icon.png"
      resolved_brand[:logo_alt] = resolved_brand[:logo_alt].presence || "#{resolved_name} logo"
      resolved_brand
    end

    def ui_marketing_configured_brand
      config = Baldur.config
      brand = if config.respond_to?(:marketing_brand)
        config.public_send(:marketing_brand)
      elsif config.instance_variable_defined?(:@marketing_brand)
        config.instance_variable_get(:@marketing_brand)
      end

      resolved_brand = brand.respond_to?(:to_h) ? brand.to_h.symbolize_keys : {}
      resolved_brand
    end
  end
end
