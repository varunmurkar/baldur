import { Controller } from "@hotwired/stimulus";
import { addClass, removeClass } from "baldur/lib/dom-helpers";

export default class SnackbarController extends Controller {
  static targets = ["progressIndicator"];

  static values = {
    snackbarTimeout: { type: Number, default: 6000 }
  };

  connect() {
    this.totalDuration = Math.max(this.snackbarTimeoutValue, 0);
    this.remainingDuration = this.totalDuration;
    this.isPaused = false;
    this.isHovered = false;
    this.hasFocusWithin = false;
    this.renderProgress(1);

    requestAnimationFrame(() => {
      addClass(this.element, "motion-layer-enter");
      addClass(this.element, "is-visible");
      this.resumeAutoHide();
    });

    this.element.addEventListener("animationend", this.handleEntryAnimationEnd);
    this.element.addEventListener("mouseenter", this.handleMouseEnter);
    this.element.addEventListener("mouseleave", this.handleMouseLeave);
    this.element.addEventListener("focusin", this.handleFocusIn);
    this.element.addEventListener("focusout", this.handleFocusOut);
  }

  disconnect() {
    this.stopCountdown();
    this.element.removeEventListener("animationend", this.handleEntryAnimationEnd);
    this.element.removeEventListener("mouseenter", this.handleMouseEnter);
    this.element.removeEventListener("mouseleave", this.handleMouseLeave);
    this.element.removeEventListener("focusin", this.handleFocusIn);
    this.element.removeEventListener("focusout", this.handleFocusOut);
  }

  scheduleAutoHide(duration) {
    clearTimeout(this.autoHideTimeout);
    this.autoHideTimeout = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  renderProgress(progress) {
    if (!this.hasProgressIndicatorTarget) return;

    const clamped = Math.min(Math.max(progress, 0), 1);
    this.progressIndicatorTarget.style.strokeDashoffset = String((1 - clamped) * 100);
  }

  stopCountdown() {
    clearTimeout(this.autoHideTimeout);
    this.autoHideTimeout = null;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pauseAutoHide() {
    if (this.isPaused || this.element.dataset.dismissed === "true") return;

    this.isPaused = true;
    if (this.totalDuration <= 0 || !this.startedAt) return;

    const elapsed = performance.now() - this.startedAt;
    this.remainingDuration = Math.max(this.remainingDuration - elapsed, 0);
    this.stopCountdown();
    this.renderProgress(this.totalDuration > 0 ? this.remainingDuration / this.totalDuration : 0);
  }

  resumeAutoHide() {
    if (this.element.dataset.dismissed === "true") return;
    if (this.isHovered || this.hasFocusWithin) return;

    if (this.remainingDuration <= 0 || this.totalDuration <= 0) {
      this.renderProgress(0);
      this.dismiss();
      return;
    }

    if (!this.isPaused && this.autoHideTimeout) return;

    this.isPaused = false;
    this.startedAt = performance.now();
    this.scheduleAutoHide(this.remainingDuration);
    this.rafId = requestAnimationFrame(this.updateProgress);
  }

  dismiss() {
    if (this.element.dataset.dismissed === "true") return;

    this.element.dataset.dismissed = "true";
    this.stopCountdown();
    this.renderProgress(0);
    addClass(this.element, "is-leaving");

    this.element.addEventListener(
      "transitionend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }

  updateProgress = (timestamp) => {
    if (this.isPaused || this.element.dataset.dismissed === "true") return;

    const elapsed = timestamp - this.startedAt;
    const remaining = Math.max(this.remainingDuration - elapsed, 0);
    this.renderProgress(this.totalDuration > 0 ? remaining / this.totalDuration : 0);

    if (remaining > 0) {
      this.rafId = requestAnimationFrame(this.updateProgress);
    } else {
      this.rafId = null;
    }
  };

  handleEntryAnimationEnd = (event) => {
    if (event.animationName !== "layer-enter") return;
    removeClass(this.element, "motion-layer-enter");
  };

  handleMouseEnter = () => {
    this.isHovered = true;
    this.pauseAutoHide();
  };

  handleMouseLeave = () => {
    this.isHovered = false;
    this.resumeAutoHide();
  };

  handleFocusIn = () => {
    this.hasFocusWithin = true;
    this.pauseAutoHide();
  };

  handleFocusOut = (event) => {
    if (this.element.contains(event.relatedTarget)) return;

    this.hasFocusWithin = false;
    this.resumeAutoHide();
  };

  // Allow manual dismissal via button
  handleDismiss(event) {
    event?.preventDefault?.();
    this.dismiss();
  }
}
