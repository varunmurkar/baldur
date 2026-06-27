module Showcase
  class HomeController < ApplicationController
    helper :ui

    def index
    end

    def components
      @component_groups = component_groups
    end

    def interactions
      @interactions = interaction_groups
    end

    def patterns
      @patterns = pattern_groups
    end

    private

    def component_groups
      [
        { title: "Actions", items: %w[button badge action_row] },
        { title: "Feedback", items: %w[alert snackbar kpi tooltip] },
        { title: "Forms", items: %w[text_field date_field checkbox hidden_field menu_select segmented_buttons] },
        { title: "Navigation", items: %w[sidebar pagination] },
        { title: "Overlays", items: %w[modal confirmation_modal panel_secondary panel_right] },
        { title: "Data", items: %w[table table_card chart_card card] },
        { title: "Marketing", items: %w[top_nav hero_section features_section pricing_tables testimonials_section faq_section cta_banner footer] }
      ]
    end

    def interaction_groups
      %w[accessibility menu_select modal sidebar snackbar panel_secondary segmented_tabs]
    end

    def pattern_groups
      %w[forms tables marketing auth]
    end
  end
end
