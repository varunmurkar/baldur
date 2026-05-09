import { Controller } from "@hotwired/stimulus";

export default class DetailsMenuController extends Controller {
  close() {
    if (!this.element.open) return;
    this.element.open = false;
  }

  closeIfClickOutside(event) {
    if (!this.element.open) return;
    if (this.element.contains(event.target)) return;

    this.close();
  }

  closeIfEscape(event) {
    if (event.key !== "Escape") return;

    this.close();
  }

  closeIfLink(event) {
    if (!this.element.open) return;

    const link = event.target.closest("a");
    if (!link) return;

    this.close();
  }
}
