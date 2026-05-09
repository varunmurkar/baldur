ENV["MT_NO_PLUGINS"] = "1"

require "bundler/setup"
require "minitest/autorun"
require "rails/generators/test_case"

require_relative "../lib/baldur"
require_relative "../app/helpers/baldur/render_helper"
require_relative "../app/helpers/baldur/marketing_helper"
