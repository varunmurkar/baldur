import { Controller } from "@hotwired/stimulus";
import { focusFirstFocusable, trapFocus, updateAriaExpanded, updateAriaHidden } from "baldur/lib/focus-management";

export default class extends Controller {
  static targets = ["panel", "button", "surface"];

  connect() {
    this.previouslyFocusedElement = null;
    this.focusTrapCleanup = null;
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.previouslyFocusedElement = document.activeElement;
    this.panelTarget.classList.remove("hidden");
    updateAriaExpanded(this.buttonTarget, true);
    updateAriaHidden(this.panelTarget, false);
    this.setBackgroundInert(true);
    this.focusTrapCleanup?.();
    this.focusTrapCleanup = trapFocus(this.surfaceTarget, () => this.close());
    this.panelTarget.addEventListener("keydown", this.handleKeydown);
    focusFirstFocusable(this.surfaceTarget);
  }

  close() {
    this.panelTarget.classList.add("hidden");
    updateAriaExpanded(this.buttonTarget, false);
    updateAriaHidden(this.panelTarget, true);
    this.panelTarget.removeEventListener("keydown", this.handleKeydown);
    this.focusTrapCleanup?.();
    this.focusTrapCleanup = null;
    this.setBackgroundInert(false);

    if (this.previouslyFocusedElement && document.body.contains(this.previouslyFocusedElement)) {
      this.previouslyFocusedElement.focus({ preventScroll: true });
    }
  }

  isOpen() {
    return !this.panelTarget.classList.contains("hidden");
  }

  handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
  }

  setBackgroundInert(inert) {
    Array.from(document.body.children).forEach((child) => {
      if (child === this.panelTarget || child.contains(this.panelTarget)) return;

      if (inert) {
        if (!child.hasAttribute("inert")) {
          child.dataset.mobileSidebarManagedInert = "true";
          child.setAttribute("inert", "");
        }
      } else if (child.dataset.mobileSidebarManagedInert === "true") {
        child.removeAttribute("inert");
        delete child.dataset.mobileSidebarManagedInert;
      }
    });
  }

  disconnect() {
    this.panelTarget?.removeEventListener("keydown", this.handleKeydown);
    this.focusTrapCleanup?.();
    this.focusTrapCleanup = null;
    this.setBackgroundInert(false);
  }
}
