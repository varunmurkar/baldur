require_relative 'test_helper'

require 'action_controller'

class BaldurSnackbarStackHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
  end

  def test_renders_stack_with_required_defaults
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: []) %>',
      formats: [:html]
    )

    assert_includes html, 'class="snackbar-stack"'
    assert_includes html, 'data-baldur-snackbar-stack="true"'
    assert_includes html, '<template data-baldur-snackbar-template>'
  end

  def test_renders_stack_with_custom_id
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: [], id: "snackbar-stack") %>',
      formats: [:html]
    )

    assert_includes html, 'id="snackbar-stack"'
  end

  def test_renders_stack_with_custom_class_and_data
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: [], class_name: "my-stack", data: { controller: "toast" }) %>',
      formats: [:html]
    )

    assert_includes html, 'class="snackbar-stack my-stack"'
    assert_includes html, 'data-controller="toast"'
    assert_includes html, 'data-baldur-snackbar-stack="true"'
  end

  def test_renders_stack_with_string_keyed_data_without_duplicate_attributes
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: [], data: { "controller" => "toast", "baldur-snackbar-stack" => "override" }) %>',
      formats: [:html]
    )

    assert_includes html, 'data-controller="toast"'
    refute_includes html, 'data-baldur-snackbar-stack="true"'
    assert_includes html, 'data-baldur-snackbar-stack="override"'
  end

  def test_renders_snackbars_inside_stack
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: [{ variant: :success, message: "Saved." }]) %>',
      formats: [:html]
    )

    assert_includes html, 'class="snackbar snackbar--success"'
    assert_includes html, 'role="status"'
    assert_includes html, 'aria-live="polite"'
    assert_includes html, 'data-snackbar-snackbar-timeout-value="6000"'
    assert_includes html, 'Saved.'
  end

  def test_error_snackbar_uses_alert_semantics_and_longer_timeout
    html = TestController.render(
      inline: '<%= ui_snackbar_stack(snackbars: [{ variant: :error, message: "Failed." }]) %>',
      formats: [:html]
    )

    assert_includes html, 'class="snackbar snackbar--error"'
    assert_includes html, 'role="alert"'
    assert_includes html, 'aria-live="assertive"'
    assert_includes html, 'data-snackbar-snackbar-timeout-value="12000"'
  end

  def test_turbo_stream_helper_requires_turbo_context
    refute TestController._helpers.instance_methods.include?(:turbo_stream)

    error = assert_raises(ActionView::Template::Error) do
      TestController.render(
        inline: '<%= ui_snackbar_turbo_stream({ notice: "Hello" }) %>',
        formats: [:html]
      )
    end

    assert_match(/requires turbo-rails/, error.message)
  end

  def test_turbo_stream_helper_produces_update_with_target_id
    turbo_module = install_turbo_stream_helper

    html = TestController.render(
      inline: '<%= ui_snackbar_turbo_stream({ notice: "Hello" }) %>',
      formats: [:html]
    )

    assert_includes html, '<turbo-stream action="update" target="snackbar-stack">'
    assert_includes html, 'id="snackbar-stack"'
    assert_includes html, 'Hello'
  ensure
    uninstall_turbo_stream_helper(turbo_module)
  end

  private

  def install_turbo_stream_helper
    return TestController.instance_variable_get(:@turbo_test_module) if TestController.instance_variable_get(:@turbo_test_module)

    turbo_test_module = Module.new do
      def turbo_stream
        @turbo_stream ||= Object.new.tap do |obj|
          obj.define_singleton_method(:update) do |target, html:|
            "<turbo-stream action=\"update\" target=\"#{target}\">#{html}</turbo-stream>".html_safe
          end
        end
      end
    end

    TestController.instance_variable_set(:@turbo_test_module, turbo_test_module)
    TestController.helper turbo_test_module
    turbo_test_module
  end

  def uninstall_turbo_stream_helper(turbo_module)
    turbo_module.module_eval do
      remove_method :turbo_stream if instance_methods(false).include?(:turbo_stream)
    end
    TestController.instance_variable_set(:@turbo_test_module, nil)
  end
end
