import { Controller } from "@hotwired/stimulus";
import { queryAll, addClass, removeClass } from "baldur/lib/dom-helpers";
import { focusFirstFocusable, updateAriaHidden } from "baldur/lib/focus-management";
import { getMotionTimings } from "baldur/lib/animation-helpers";

export default class ModalController extends Controller {
  static targets = ["dialog"];
  static values = { selector: String };

  connect() {
    this.timings = getMotionTimings();
    this.dialogElements = this.hasDialogTarget ? this.dialogTargets : [this.element];
    this.previouslyFocusedElement = null;
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
    this.dialogElements.forEach((dialog) => {
      dialog.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.close();
      });

      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) this.close();
      });
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

    this.dialogElements.forEach((dialog) => {
      clearTimeout(dialog.__modalHideTimeout);
      removeClass(dialog, "hidden", "is-hiding");
      dialog.removeAttribute("inert");
      updateAriaHidden(dialog, false);

      requestAnimationFrame(() => {
        addClass(dialog, "is-visible");
        focusFirstFocusable(dialog);
        this.dispatchOpenedHooks(dialog);
      });
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

    this.dialogElements.forEach((dialog) => {
      this.pauseMedia(dialog);
      this.restoreFocus(dialog);

      removeClass(dialog, "is-visible");
      addClass(dialog, "is-hiding");
      dialog.setAttribute("inert", "");
      updateAriaHidden(dialog, true);

      clearTimeout(dialog.__modalHideTimeout);
      dialog.__modalHideTimeout = setTimeout(() => {
        addClass(dialog, "hidden");
        removeClass(dialog, "is-hiding");
      }, this.timings.fadeOut);
    });
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
}
