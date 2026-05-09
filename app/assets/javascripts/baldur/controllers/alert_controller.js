import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["details", "expandButton", "actions"];
  static values = {
    collapsed: Boolean,
    storageKey: String
  };

  initialize() {
    this.loadingStoredState = true;
  }

  connect() {
    const storedValue = this.readStoredValue();
    if (storedValue !== null) {
      this.collapsedValue = storedValue === "true";
    }

    this.loadingStoredState = false;
    this.syncUI({ immediate: true });
  }

  collapse(event) {
    event.preventDefault();
    this.collapsedValue = true;
  }

  expand(event) {
    event.preventDefault();
    this.collapsedValue = false;
  }

  collapsedValueChanged() {
    if (this.loadingStoredState) {
      return;
    }

    this.writeStoredValue(String(this.collapsedValue));
    this.syncUI();
  }

  readStoredValue() {
    const key = this.storageKeyValue;
    if (!key) return null;

    try {
      const value = window.localStorage.getItem(key);
      if (value !== null) return value;
    } catch {
      // localStorage may be disabled
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  writeStoredValue(value) {
    const key = this.storageKeyValue;
    if (!key) return;

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // localStorage may be disabled
    }

    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
  }

  syncUI({ immediate = false } = {}) {
    this.element.dataset.alertCollapsedValue = String(this.collapsedValue);

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (immediate || prefersReducedMotion || !this.hasDetailsTarget) {
      this.applyStaticState();
      return;
    }

    if (this.collapsedValue) {
      this.animateCollapse();
      return;
    }

    this.animateExpand();
  }

  applyStaticState() {
    this.element.classList.toggle("alert--collapsed", this.collapsedValue);

    if (this.hasDetailsTarget) {
      this.detailsTarget.setAttribute("aria-hidden", String(this.collapsedValue));
      this.detailsTarget.style.maxHeight = this.collapsedValue ? "0px" : "none";
      this.detailsTarget.style.opacity = this.collapsedValue ? "0" : "1";
    }

    if (this.hasActionsTarget) {
      this.actionsTarget.hidden = this.collapsedValue;
    }

    if (this.hasExpandButtonTarget) {
      this.expandButtonTarget.hidden = !this.collapsedValue;
      this.syncExpandButtonAria();
    }
  }

  animateExpand() {
    this.element.classList.remove("alert--collapsed");

    if (this.hasExpandButtonTarget) {
      this.expandButtonTarget.hidden = true;
    }

    if (this.hasActionsTarget) {
      this.actionsTarget.hidden = false;
    }

    const content = this.detailsTarget;
    content.setAttribute("aria-hidden", "false");
    content.style.maxHeight = "0px";
    content.style.opacity = "0";

    requestAnimationFrame(() => {
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.opacity = "1";
    });

    this.finishAfterTransition(content, () => {
      content.style.maxHeight = "none";
      this.syncExpandButtonAria();
    });
  }

  animateCollapse() {
    const content = this.detailsTarget;
    this.element.classList.remove("alert--collapsed");

    if (this.hasActionsTarget) {
      this.actionsTarget.hidden = true;
    }

    if (this.hasExpandButtonTarget) {
      this.expandButtonTarget.hidden = false;
      this.syncExpandButtonAria();
    }

    content.setAttribute("aria-hidden", "true");
    content.style.maxHeight = `${content.scrollHeight}px`;
    content.style.opacity = "1";

    requestAnimationFrame(() => {
      content.style.maxHeight = "0px";
      content.style.opacity = "0";
    });

    this.finishAfterTransition(content, () => {
      this.element.classList.add("alert--collapsed");
    });
  }

  syncExpandButtonAria() {
    if (!this.hasExpandButtonTarget) return;

    const button = this.expandButtonTarget.querySelector("button, a");
    if (button) {
      button.setAttribute("aria-expanded", String(!this.collapsedValue));
    }
  }

  finishAfterTransition(content, callback) {
    const duration = this.transitionDurationMs(content);
    let completed = false;

    const complete = () => {
      if (completed) return;
      completed = true;
      content.removeEventListener("transitionend", onComplete);
      callback();
    };

    const onComplete = (event) => {
      if (event.target !== content || event.propertyName !== "max-height") {
        return;
      }

      complete();
    };

    content.addEventListener("transitionend", onComplete);
    window.setTimeout(complete, duration + 50);
  }

  transitionDurationMs(content) {
    const styles = window.getComputedStyle(content);
    const durations = styles.transitionDuration.split(",").map((value) => this.parseTimeValue(value));
    const delays = styles.transitionDelay.split(",").map((value) => this.parseTimeValue(value));
    const pairs = durations.map((duration, index) => duration + (delays[index] || delays[0] || 0));

    return Math.max(...pairs, 0);
  }

  parseTimeValue(rawValue) {
    const value = rawValue.trim();
    if (value.endsWith("ms")) return Number.parseFloat(value);
    if (value.endsWith("s")) return Number.parseFloat(value) * 1000;

    return 0;
  }
}
