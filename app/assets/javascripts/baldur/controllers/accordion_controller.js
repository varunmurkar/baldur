import { Controller } from "@hotwired/stimulus";
import { updateAriaExpanded } from "baldur/lib/focus-management";

export default class AccordionController extends Controller {
  static targets = ["item", "content", "icon"];
  static values = {
    allowMultiple: { type: Boolean, default: false },
    transitionDuration: { type: Number, default: 300 }
  };

  connect() {
    this.setupInitialState();
    this.handleTurboFrameLoad = this.handleTurboFrameLoad.bind(this);
    this.element.addEventListener("turbo:frame-load", this.handleTurboFrameLoad);
  }

  disconnect() {
    this.element.removeEventListener("turbo:frame-load", this.handleTurboFrameLoad);
  }

  setupInitialState() {
    this.itemTargets.forEach((item) => {
      const isOpen = item.dataset.open === "true";
      const content = item.querySelector('[data-accordion-target="content"]');
      const icon = item.querySelector('[data-accordion-target="icon"]');
      const button = item.querySelector("button");

      if (!content) return;

      content.style.transition = `max-height ${this.transitionDurationValue}ms var(--motion-easing-standard, ease), opacity ${this.transitionDurationValue}ms var(--motion-easing-standard, ease)`;
      content.style.overflow = "hidden";

      if (isOpen) {
        content.removeAttribute("hidden");
        content.removeAttribute("inert");
        content.style.maxHeight = "200px";
        content.style.opacity = "1";

        setTimeout(() => {
          content.style.maxHeight = `${content.scrollHeight}px`;

          setTimeout(() => {
            if (item.dataset.open === "true") {
              content.style.maxHeight = "none";
            }
          }, this.transitionDurationValue);
        }, 100);
      } else {
        content.setAttribute("hidden", "");
        content.setAttribute("inert", "");
        content.style.maxHeight = "0px";
        content.style.opacity = "0";
      }

      this.updateIcon(icon, isOpen);
      this.updateAriaState(button, content, isOpen);
    });
  }

  handleTurboFrameLoad() {
    this.itemTargets.forEach((item) => {
      if (item.dataset.open !== "true") return;
      const content = item.querySelector('[data-accordion-target="content"]');
      if (!content) return;

      content.style.maxHeight = "none";
      const newHeight = content.scrollHeight;
      content.style.maxHeight = `${newHeight}px`;

      setTimeout(() => {
        if (item.dataset.open === "true") {
          content.style.maxHeight = "none";
        }
      }, 50);
    });
  }

  toggle(event) {
    const button = event.currentTarget;
    const item = button.closest('[data-accordion-target="item"]');
    const content = item?.querySelector('[data-accordion-target="content"]');
    const icon = item?.querySelector('[data-accordion-target="icon"]');

    if (!item || !content) return;

    const isOpen = content.style.maxHeight !== "0px" && content.style.maxHeight !== "";

    if (isOpen) {
      this.closeItem(item, content, icon, button);
    } else {
      if (!this.allowMultipleValue) {
        this.closeAllItems(item);
      }
      this.openItem(item, content, icon, button);
    }
  }

  openItem(item, content, icon, button) {
    content.removeAttribute("hidden");
    content.removeAttribute("inert");
    content.style.maxHeight = `${content.scrollHeight}px`;
    content.style.opacity = "1";
    item.dataset.open = "true";

    this.updateIcon(icon, true);
    this.updateAriaState(button, content, true);

    setTimeout(() => {
      if (item.dataset.open === "true") {
        content.style.maxHeight = "none";
      }
    }, this.transitionDurationValue);
  }

  closeItem(item, content, icon, button) {
    content.style.maxHeight = `${content.scrollHeight}px`;
    content.offsetHeight;
    content.style.maxHeight = "0px";
    content.style.opacity = "0";
    item.dataset.open = "false";
    content.setAttribute("inert", "");

    this.updateIcon(icon, false);
    this.updateAriaState(button, content, false);

    clearTimeout(content.__accordionHideTimeout);
    content.__accordionHideTimeout = setTimeout(() => {
      if (item.dataset.open !== "true") {
        content.setAttribute("hidden", "");
      }
    }, this.transitionDurationValue);
  }

  closeAllItems(exceptItem) {
    this.itemTargets.forEach((item) => {
      if (item === exceptItem) return;
      const content = item.querySelector('[data-accordion-target="content"]');
      const icon = item.querySelector('[data-accordion-target="icon"]');
      const button = item.querySelector("button");

      if (!content) return;
      if (content.style.maxHeight === "0px" || content.style.maxHeight === "") return;

      this.closeItem(item, content, icon, button);
    });
  }

  updateIcon(icon, isOpen) {
    if (!icon) return;
    icon.style.transition = `transform ${this.transitionDurationValue}ms var(--motion-easing-standard, ease)`;
    icon.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
  }

  updateAriaState(button, content, isOpen) {
    if (button) {
      updateAriaExpanded(button, isOpen);
    }
    if (content) {
      content.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }
  }
}
