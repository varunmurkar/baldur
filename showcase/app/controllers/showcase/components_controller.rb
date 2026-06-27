module Showcase
  class ComponentsController < ApplicationController
    helper :ui

    PARTIALS = %w[
      button
      badge
      action_row
      alert
      snackbar
      kpi
      tooltip
      text_field
      date_field
      checkbox
      menu_select
      segmented_buttons
      sidebar
      pagination
      modal
      confirmation_modal
      panel_secondary
      table
      table_card
      chart_card
      card
      top_nav
      hero_section
      features_section
      pricing_tables
      testimonials_section
      faq_section
      cta_banner
      footer
    ].freeze

    def show
      @id = params[:id]
      render "showcase/not_found", status: :not_found unless PARTIALS.include?(@id)
    end
  end
end
