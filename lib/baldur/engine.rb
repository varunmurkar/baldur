module Baldur
  class Engine < ::Rails::Engine
    isolate_namespace Baldur

    initializer 'baldur.importmap', before: 'importmap' do |app|
      app.config.importmap.paths << Engine.root.join('config/importmap.rb')
      app.config.importmap.cache_sweepers << Engine.root.join('app/assets/javascripts')
    end
  end
end
