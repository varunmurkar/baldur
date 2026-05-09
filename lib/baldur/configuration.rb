module Baldur
  class Configuration
    attr_accessor :warning_dependency_resolver,
                  :dependency_dataset_name_resolver,
                  :unavailable_fallback_message,
                  :marketing_brand,
                  :default_google_sign_in_path,
                  :theme_storage_key

    def initialize
      @warning_dependency_resolver = ->(_warning_keys) { [] }
      @dependency_dataset_name_resolver = ->(dataset_key) { dataset_key.to_s.humanize }
      @unavailable_fallback_message = "Missing metric or raw data required to compute this value."
      @marketing_brand = {
        name: "Brand",
        wordmark: "Brand",
        logo_src: "/icon.png",
        logo_alt: "Brand logo"
      }
      @default_google_sign_in_path = nil
      @theme_storage_key = "baldur.theme"
    end
  end
end
