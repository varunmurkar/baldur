import { Controller } from "@hotwired/stimulus";
import { getFromStorage, saveToStorage, getSystemPreference } from "baldur/lib/storage-helpers";
import { addClass, removeClass, toggleClass, setAttrs } from "baldur/lib/dom-helpers";

export default class ThemeController extends Controller {
  static targets = ["toggle"];
  static values = {
    storageKey: { type: String, default: "baldur.theme" },
    themes: { type: Array, default: ["light", "dark"] }
  };

  connect() {
    this.initializeTheme();
    this.attachEventListeners();
  }

  initializeTheme() {
    const theme = this.getCurrentTheme();
    this.applyTheme(theme, false);
    this.syncToggles(theme);
  }

  attachEventListeners() {
    this.toggleTargets.forEach((toggle) => {
      toggle.addEventListener("change", () => this.handleToggleChange(toggle));
    });
  }

  getCurrentTheme() {
    // 1. Check localStorage
    const stored = getFromStorage(this.storageKeyValue);
    if (stored && this.themesValue.includes(stored)) return stored;

    // 2. Default to light when user has not chosen a theme.
    return "light";
  }

  handleToggleChange(toggle) {
    const newTheme = toggle.checked ? "dark" : "light";
    this.applyTheme(newTheme, true);
    saveToStorage(this.storageKeyValue, newTheme);
    this.syncToggles(newTheme);
  }

  toggle(event) {
    event?.preventDefault();

    const newTheme = this.getTheme() === "dark" ? "light" : "dark";
    this.applyTheme(newTheme, true);
    saveToStorage(this.storageKeyValue, newTheme);
    this.syncToggles(newTheme);
  }

  applyTheme(theme, animate = false) {
    const root = document.documentElement;

    if (animate) {
      addClass(root, "theme-transition");
      setTimeout(() => removeClass(root, "theme-transition"), 800);
    }

    // Remove all theme classes
    this.themesValue.forEach((cls) => removeClass(root, cls));

    // Add new theme class
    addClass(root, theme);
    setAttrs(root, { "data-theme": theme });

    // Update global state
    window.__baldurThemeState = theme;
  }

  syncToggles(theme) {
    this.toggleTargets.forEach((toggle) => {
      toggle.checked = theme === "dark";
    });
  }

  // Public API for external access
  getTheme() {
    return window.__baldurThemeState || this.getCurrentTheme();
  }

  setTheme(theme, options = {}) {
    const { animate = true } = options;
    this.applyTheme(theme, animate);
    saveToStorage(this.storageKeyValue, theme);
    this.syncToggles(theme);
  }
}
