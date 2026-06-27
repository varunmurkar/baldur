ENV['MT_NO_PLUGINS'] = '1'

require 'bundler/setup'
require 'minitest/autorun'
require 'rack/test'

require_relative '../config/environment'

Rails.env = 'test'
