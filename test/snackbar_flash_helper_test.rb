require_relative 'test_helper'

class BaldurSnackbarFlashHelperTest < Minitest::Test
  include Baldur::UiHelperFeedback

  def test_string_success_flash
    flash = { success: "User created." }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :success, result[0][:variant]
    assert_equal "User created.", result[0][:message]
  end

  def test_string_notice_flash
    flash = { notice: "Check your email." }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :notice, result[0][:variant]
    assert_equal "Check your email.", result[0][:message]
  end

  def test_string_alert_flash
    flash = { alert: "Something went wrong." }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :error, result[0][:variant]
    assert_equal "Something went wrong.", result[0][:message]
  end

  def test_string_warning_flash
    flash = { warning: "Rate limited." }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :warning, result[0][:variant]
    assert_equal "Rate limited.", result[0][:message]
  end

  def test_blank_flash_values_filtered
    flash = { success: "", notice: nil, alert: "Failed." }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :error, result[0][:variant]
  end

  def test_multiple_flash_keys
    flash = { success: "Created.", alert: "But something else failed." }
    result = snackbar_flash_payloads(flash)
    assert_equal 2, result.length
  end

  def test_empty_flash
    result = snackbar_flash_payloads({})
    assert_equal [], result
  end

  def test_hash_payload_with_custom_title
    flash = { alert: { title: "Sign in failed", message: "Invalid credentials." } }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :error, result[0][:variant]
    assert_equal "Sign in failed", result[0][:title]
    assert_equal "Invalid credentials.", result[0][:message]
  end

  def test_hash_payload_reverse_merges_variant
    flash = { success: { title: "Done!", message: "Record saved." } }
    result = snackbar_flash_payloads(flash)
    assert_equal 1, result.length
    assert_equal :success, result[0][:variant]
    assert_equal "Done!", result[0][:title]
  end
end