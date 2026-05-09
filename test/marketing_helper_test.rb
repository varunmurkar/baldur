require_relative "test_helper"

class BaldurMarketingHelperTest < Minitest::Test
  HelperHost = Struct.new(:config) do
    include Baldur::MarketingHelper
  end

  def setup
    @original_brand = Baldur.config.marketing_brand
  end

  def teardown
    Baldur.config.marketing_brand = @original_brand
  end

  def test_uses_configured_brand_without_host_helper_fallback
    Baldur.config.marketing_brand = {
      name: "Standalone",
      wordmark: "Standalone UI",
      logo_src: "/standalone-logo.svg"
    }

    helper = HelperHost.new(Baldur.config)
    resolved = helper.send(:ui_marketing_configured_brand)

    assert_equal "Standalone", resolved[:name]
    assert_equal "Standalone UI", resolved[:wordmark]
    assert_equal "/standalone-logo.svg", resolved[:logo_src]
  end

  def test_returns_empty_brand_hash_when_no_brand_is_configured
    Baldur.config.marketing_brand = nil

    helper = HelperHost.new(Baldur.config)

    assert_equal({}, helper.send(:ui_marketing_configured_brand))
  end
end
