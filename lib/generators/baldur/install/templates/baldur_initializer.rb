require "baldur"

Baldur.configure do |config|
  config.unavailable_fallback_message = "Missing metric or raw data required to compute this value."
  config.theme_storage_key = "baldur.theme"
  config.marketing_brand = {
    name: "Your Brand",
    wordmark: "Your Brand",
    logo_src: "/icon.png",
    logo_alt: "Your Brand logo"
  }

  # Supply host-specific lookups when using unavailable dependency helpers.
  config.warning_dependency_resolver = ->(_warning_keys) { [] }
  config.dependency_dataset_name_resolver = ->(dataset_key) { dataset_key.to_s.humanize }

  # Optional integrations.
  config.default_google_sign_in_path = nil
end
