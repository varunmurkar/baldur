import { Controller } from "@hotwired/stimulus";
import { queryAll, addClass, removeClass } from "baldur/lib/dom-helpers";
import { focusFirstFocusable, updateAriaHidden, trapFocus } from "baldur/lib/focus-management";
import { getMotionTimings } from "baldur/lib/animation-helpers";

export default class ModalController extends Controller {
  static targets = ["dialog"];
  static values = { selector: String };

  connect() {
    this.timings = getMotionTimings();
    this.dialogElements = this.hasDialogTarget ? this.dialogTargets : queryAll('[role="dialog"]', this.element);
    if (this.dialogElements.length === 0) this.dialogElements = [this.element];
    this.previouslyFocusedElement = null;
    this.focusTrapCleanup = null;
    this.setupDialogTriggers();
    this.attachCloseHandlers();
    this.attachKeyboardHandlers();
  }

  setupDialogTriggers() {
    const triggers = queryAll(`[data-open-modal="${this.selectorValue}"]`);
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.previouslyFocusedElement = trigger;
        this.open();
      });
    });
  }

  attachKeyboardHandlers() {
    this.element.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });

    this.element.addEventListener("click", (e) => {
      if (e.target === this.element) this.close();
    });
  }

  attachCloseHandlers() {
    const closers = queryAll("[data-modal-close]", this.element);
    closers.forEach((closer) => {
      closer.addEventListener("click", (e) => {
        e.preventDefault();
        this.close();
      });
    });
  }

  open() {
    if (!this.previouslyFocusedElement) {
      this.previouslyFocusedElement = document.activeElement;
    }

    clearTimeout(this.element.__modalHideTimeout);
    removeClass(this.element, "hidden", "is-hiding");
    this.element.removeAttribute("inert");
    updateAriaHidden(this.element, false);
    this.setBackgroundInert(true);

    requestAnimationFrame(() => {
      addClass(this.element, "is-visible");
      const primaryDialog = this.dialogElements[0] || this.element;
      this.focusTrapCleanup?.();
      this.focusTrapCleanup = trapFocus(primaryDialog, () => this.close());
      focusFirstFocusable(primaryDialog);
      this.dispatchOpenedHooks(primaryDialog);
    });
  }

  dispatchOpenedHooks(dialog) {
    const detail = {
      id: dialog?.id || null,
      selector: this.selectorValue || null,
      element: dialog
    };

    dialog?.dispatchEvent(new CustomEvent("baldur:modal:opened", { bubbles: true, detail }));
    window.dispatchEvent(new CustomEvent("baldur:modal:opened", { detail }));

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    });
  }

  close() {
    this.closeOpenMenus();

    this.focusTrapCleanup?.();
    this.focusTrapCleanup = null;
    this.pauseMedia(this.element);
    this.restoreFocus(this.element);

    removeClass(this.element, "is-visible");
    addClass(this.element, "is-hiding");
    this.element.setAttribute("inert", "");
    updateAriaHidden(this.element, true);
    this.setBackgroundInert(false);

    clearTimeout(this.element.__modalHideTimeout);
    this.element.__modalHideTimeout = setTimeout(() => {
      addClass(this.element, "hidden");
      removeClass(this.element, "is-hiding");
    }, this.timings.fadeOut);
  }

  pauseMedia(dialog) {
    const mediaElements = dialog?.querySelectorAll("video, audio") || [];
    mediaElements.forEach((mediaElement) => {
      if (typeof mediaElement.pause === "function") {
        mediaElement.pause();
      }
    });
  }

  closeOpenMenus() {
    const openMenus = this.element.querySelectorAll(".menu-select.is-open");

    openMenus.forEach((menu) => {
      menu.__stimulusController?.close?.();
    });
  }

  restoreFocus(dialog) {
    const activeElement = document.activeElement;
    if (!dialog || !activeElement || !dialog.contains(activeElement)) return;

    const fallback = this.previouslyFocusedElement;
    if (fallback && document.body.contains(fallback) && typeof fallback.focus === "function") {
      fallback.focus({ preventScroll: true });
      return;
    }

    const root = document.querySelector("main") || document.body;
    if (!root) return;

    const needsTabIndex = !root.hasAttribute("tabindex");
    if (needsTabIndex) root.setAttribute("tabindex", "-1");

    root.focus({ preventScroll: true });

    if (needsTabIndex) {
      setTimeout(() => {
        if (document.body.contains(root)) root.removeAttribute("tabindex");
      }, 0);
    }
  }

  setBackgroundInert(inert) {
    Array.from(document.body.children).forEach((child) => {
      if (child === this.element) return;

      if (inert) {
        if (!child.hasAttribute("inert")) {
          child.dataset.modalManagedInert = "true";
          child.setAttribute("inert", "");
        }
      } else if (child.dataset.modalManagedInert === "true") {
        child.removeAttribute("inert");
        delete child.dataset.modalManagedInert;
      }
    });
  }

  disconnect() {
    this.focusTrapCleanup?.();
    this.focusTrapCleanup = null;
    this.setBackgroundInert(false);
  }
}
