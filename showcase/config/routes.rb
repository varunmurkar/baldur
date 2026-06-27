Rails.application.routes.draw do
  root "showcase/home#index"

  scope module: :showcase do
    get "/components", to: "home#components", as: :components_index
    get "/components/:id", to: "components#show", as: :component

    get "/interactions", to: "home#interactions", as: :interactions_index
    get "/interactions/:id", to: "interactions#show", as: :interaction

    get "/patterns", to: "home#patterns", as: :patterns_index
    get "/patterns/:id", to: "patterns#show", as: :pattern
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
