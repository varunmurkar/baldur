module Showcase
  class InteractionsController < ApplicationController
    helper :ui

    PARTIALS = %w[
      accessibility
      menu_select
      modal
      sidebar
      snackbar
      panel_secondary
      segmented_tabs
    ].freeze

    def show
      @id = params[:id]
      render "showcase/not_found", status: :not_found unless PARTIALS.include?(@id)
    end
  end
end
