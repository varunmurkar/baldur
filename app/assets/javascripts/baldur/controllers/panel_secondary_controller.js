import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["panel", "trigger"];
  static values = {
    pushSelector: { type: String, default: "main" }
  };

  connect() {
    this.element.__panelSecondaryController = this;
    this.externalTriggerBindings = [];
    this.panelSelector = this.hasPanelTarget && this.panelTarget.id ? `#${this.panelTarget.id}` : null;
    this.isOpen = this.panelTarget?.classList.contains("is-open") || this.panelTarget?.getAttribute("aria-hidden") === "false";
    this.setupExternalTriggers();
    this.syncState(this.isOpen);
  }

  disconnect() {
    if (this.element.__panelSecondaryController === this) {
      delete this.element.__panelSecondaryController;
    }

    this.teardownExternalTriggers();
    this.syncPushSurface(false);
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open(detail = this.defaultDetail()) {
    if (!this.hasPanelTarget) return;

    this.isOpen = true;
    this.syncState(true);
    this.dispatchOpenedHooks(detail);
  }

  close() {
    if (!this.hasPanelTarget) return;

    this.isOpen = false;
    this.syncState(false);
    this.dispatchClosedHooks();
  }

  syncState(open) {
    this.panelTarget.classList.toggle("is-open", open);
    this.panelTarget.setAttribute("aria-hidden", String(!open));
    this.syncTrigger(open);
    this.syncPushSurface(open);
  }

  syncTrigger(open) {
    if (!this.hasTriggerTarget) return;
    this.triggerTarget.setAttribute("aria-expanded", String(open));
  }

  syncPushSurface(open) {
    const target = document.querySelector(this.pushSelectorValue);
    if (!target || !this.hasPanelTarget) return;

    target.style.paddingRight = open ? `${this.panelTarget.offsetWidth}px` : "";
  }

  setupExternalTriggers() {
    if (!this.panelSelector) return;

    const triggers = document.querySelectorAll(`[data-open-panel="${this.panelSelector}"]`);
    triggers.forEach((trigger) => {
      const handler = (event) => {
        event.preventDefault();
        this.previouslyFocusedElement = trigger;
        this.open(this.detailFromTrigger(trigger));
      };

      trigger.addEventListener("click", handler);
      this.externalTriggerBindings.push({ trigger, handler });
    });
  }

  teardownExternalTriggers() {
    this.externalTriggerBindings.forEach(({ trigger, handler }) => {
      trigger.removeEventListener("click", handler);
    });
    this.externalTriggerBindings = [];
  }

  detailFromTrigger(trigger) {
    return {
      ...this.defaultDetail(),
      trigger,
      payload: this.parsePayload(trigger?.dataset.panelPayload)
    };
  }

  defaultDetail() {
    return {
      id: this.hasPanelTarget ? this.panelTarget.id : null,
      selector: this.panelSelector,
      trigger: null,
      payload: null
    };
  }

  parsePayload(raw) {
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  dispatchOpenedHooks(detail) {
    const payload = detail || this.defaultDetail();

    this.element.dispatchEvent(new CustomEvent("baldur:panel:opened", { bubbles: true, detail: payload }));
    window.dispatchEvent(new CustomEvent("baldur:panel:opened", { detail: payload }));
  }

  dispatchClosedHooks() {
    const detail = this.defaultDetail();

    this.element.dispatchEvent(new CustomEvent("baldur:panel:closed", { bubbles: true, detail }));
    window.dispatchEvent(new CustomEvent("baldur:panel:closed", { detail }));
  }
}
