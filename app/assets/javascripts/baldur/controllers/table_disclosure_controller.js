import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["content", "trigger"];

  connect() {
    this.open = false;
    this.contentTarget.hidden = true;
    this.contentTarget.setAttribute("inert", "");
    this.contentTarget.setAttribute("aria-hidden", "true");
    this.contentTarget.style.maxHeight = "0px";
    this.triggerTarget.setAttribute("aria-expanded", "false");
  }

  toggle(event) {
    event.preventDefault();

    if (this.open) {
      this.close();
      return;
    }

    this.openDisclosure();
  }

  openDisclosure() {
    const content = this.contentTarget;
    this.open = true;
    this.element.classList.add("is-open");
    this.triggerTarget.setAttribute("aria-expanded", "true");
    content.hidden = false;
    content.removeAttribute("inert");
    content.setAttribute("aria-hidden", "false");
    content.style.maxHeight = "0px";

    requestAnimationFrame(() => {
      content.style.maxHeight = `${content.scrollHeight}px`;
    });
  }

  close() {
    const content = this.contentTarget;
    this.open = false;
    this.element.classList.remove("is-open");
    this.triggerTarget.setAttribute("aria-expanded", "false");
    content.setAttribute("inert", "");
    content.setAttribute("aria-hidden", "true");
    content.style.maxHeight = `${content.scrollHeight}px`;

    requestAnimationFrame(() => {
      content.style.maxHeight = "0px";
    });

    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      if (!this.open) content.hidden = true;
    }, 180);
  }
}
