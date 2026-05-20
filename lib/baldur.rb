require 'rails'
require 'lucide-rails'

require_relative 'baldur/version'
require_relative 'baldur/configuration'
require_relative 'baldur/engine'

module Baldur
  class << self
    def config
      @config ||= Configuration.new
    end

    def configure
      yield(config)
    end
  end
end
