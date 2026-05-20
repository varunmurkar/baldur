require_relative 'test_helper'
require 'action_controller'
require_relative '../lib/generators/baldur/install/install_generator'

class BaldurConfirmationModalHelperTest < Minitest::Test
  class TestController < ActionController::Base
    append_view_path File.expand_path('../app/views', __dir__)
    helper Baldur::UiHelper
    helper Baldur::RenderHelper
  end

  def test_ui_modal_host_renders_host_wrapper
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_modal_host(id: "test-modal") do %>
          <p>Modal content</p>
        <% end %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'id="test-modal"'
    assert_includes html, 'data-controller="modal"'
    assert_includes html, 'data-modal-selector-value="#test-modal"'
    assert_includes html, 'data-modal="true"'
    assert_includes html, 'aria-hidden="true"'
    assert_includes html, 'Modal content'
    assert_includes html, 'class="fixed inset-0 z-50'
  end

  def test_ui_modal_host_with_custom_classes
    html = TestController.render(
      inline: <<~ERB,
        <%= ui_modal_host(id: "custom-modal", classes: "my-extra-class") do %>
          <p>Custom</p>
        <% end %>
      ERB
      formats: [:html]
    )

    assert_includes html, 'my-extra-class'
    assert_includes html, 'Custom'
  end

  def test_ui_confirmation_modal_renders_basic_structure
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "delete-modal",
          dialog_id: "delete-dialog",
          title: "Delete item?"
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'id="delete-modal"'
    assert_includes html, 'id="delete-dialog"'
    assert_includes html, 'data-controller="modal"'
    assert_includes html, 'Delete item?'
    assert_includes html, 'Confirm'
    assert_includes html, 'Cancel'
    assert_includes html, 'data-modal-close="true"'
  end

  def test_ui_confirmation_modal_with_danger_tone_shows_icon
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "danger-modal",
          dialog_id: "danger-dialog",
          title: "Discard collection?",
          tone: :danger
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'color-error'
    assert_includes html, 'Discard collection?'
  end

  def test_ui_confirmation_modal_default_tone_no_icon
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "default-modal",
          dialog_id: "default-dialog",
          title: "Proceed?"
        )
      %>',
      formats: [:html]
    )

    refute_includes html, 'color-error'
    assert_includes html, 'Proceed?'
  end

  def test_ui_confirmation_modal_danger_tone_sets_danger_button_variant
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "danger-btn-modal",
          dialog_id: "danger-btn-dialog",
          title: "Discard?",
          tone: :danger
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'button--error'
  end

  def test_ui_confirmation_modal_default_tone_sets_primary_button_variant
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "primary-btn-modal",
          dialog_id: "primary-btn-dialog",
          title: "Proceed?"
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'button--filled'
    refute_includes html, 'button--error'
  end

  def test_ui_confirmation_modal_with_type_to_confirm
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "flush-modal",
          dialog_id: "flush-dialog",
          title: "Flush All Data",
          description: "This cannot be undone.",
          tone: :danger,
          confirm_label: "Confirm",
          type_to_confirm: {
            expected_text: "confirm",
            label: "Type confirm to continue",
            placeholder: "confirm",
            hint: "This permanently removes all data."
          }
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'modal confirmation'
    assert_includes html, 'confirmation-case-sensitive-value'
    assert_includes html, 'data-confirmation-target="input"'
    assert_includes html, 'data-confirmation-target="submit"'
    assert_includes html, 'confirmation#validate'
    assert_includes html, 'Type confirm to continue'
    assert_includes html, 'This permanently removes all data.'
    assert_includes html, 'Flush All Data'
    assert_includes html, 'Confirm'
    assert_includes html, 'field text-field'
    assert_includes html, 'field__label'
  end

  def test_ui_confirmation_modal_type_to_confirm_disables_submit
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "disabled-modal",
          dialog_id: "disabled-dialog",
          title: "Delete?",
          type_to_confirm: {
            expected_text: "DELETE",
            label: "Type DELETE"
          }
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'disabled'
    assert_includes html, 'Type DELETE'
  end

  def test_ui_confirmation_modal_type_to_confirm_case_insensitive
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "ci-modal",
          dialog_id: "ci-dialog",
          title: "Delete?",
          type_to_confirm: {
            expected_text: "delete",
            case_sensitive: false
          }
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'confirmation-case-sensitive-value'
    refute_includes html, 'case-sensitive-value="true"'
    assert_includes html, 'case-sensitive-value=&quot;false&quot;'
  end

  def test_ui_confirmation_modal_without_type_to_confirm_has_no_confirmation_controller
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "simple-modal",
          dialog_id: "simple-dialog",
          title: "Are you sure?"
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'data-controller="modal"'
    refute_includes html, 'confirmation'
    refute_includes html, 'field text-field'
  end

  def test_ui_confirmation_modal_custom_labels
    html = TestController.render(
      inline: '<%=
        ui_confirmation_modal(
          host_id: "custom-modal",
          dialog_id: "custom-dialog",
          title: "Discard?",
          confirm_label: "Discard",
          cancel_label: "Go back"
        )
      %>',
      formats: [:html]
    )

    assert_includes html, 'Discard'
    assert_includes html, 'Go back'
  end

  def test_install_generator_includes_confirmation_controller
    assert_includes Baldur::Generators::InstallGenerator::CORE_CONTROLLERS, 'confirmation'
  end
end
