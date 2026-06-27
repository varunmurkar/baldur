module Showcase
  class PatternsController < ApplicationController
    helper :ui

    PARTIALS = %w[
      forms
      tables
      marketing
      auth
    ].freeze

    def show
      @id = params[:id]
      render "showcase/not_found", status: :not_found unless PARTIALS.include?(@id)
    end
  end
end
