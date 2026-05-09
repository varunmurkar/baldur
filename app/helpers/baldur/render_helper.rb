module Baldur
  module RenderHelper
    private

    def baldur_render(template, **locals)
      if respond_to?(:lookup_context) && lookup_context.view_paths.to_a.any?
        render partial: template, locals: locals
      else
        ApplicationController.render(partial: template, locals: locals)
      end
    end
  end
end
