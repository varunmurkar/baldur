import { Controller } from "@hotwired/stimulus";

export default class ConfirmationController extends Controller {
  static targets = ["input", "submit", "expectedText"];
  static values = { caseSensitive: { type: Boolean, default: true } };

  connect() {
    this.validate();
  }

  validate() {
    if (!this.hasSubmitTarget || !this.hasInputTarget) return;

    const input = this.inputTarget.value.trim();
    const expected = this.hasExpectedTextTarget ? this.expectedTextTarget.textContent.trim() : "";

    const matches = this.caseSensitiveValue
      ? input === expected
      : input.toLowerCase() === expected.toLowerCase();

    this.submitTarget.disabled = !matches;
  }
}