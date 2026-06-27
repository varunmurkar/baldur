class ApplicationController < ActionController::Base
  allow_browser versions: :modern
end

module Showcase
  class ApplicationController < ::ApplicationController
  end
end
