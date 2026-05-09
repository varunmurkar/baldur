import { Controller } from "@hotwired/stimulus";
import { iconSvg } from "baldur/lib/lucide";

export default class extends Controller {
  static targets = ["toggleButton", "toggleIcon"]
  static values = {
    collapsed: Boolean,
    storageKey: { type: String, default: "baldur-sidebar-collapsed" }
  }

  initialize() {
    this._loadingStoredState = true
  }

  connect() {
    const stored = this.readStoredValue()
    if (stored !== null) {
      this.collapsedValue = stored === "true"
    }

    this._loadingStoredState = false
    this.syncUI()
  }

  toggle() {
    this.collapsedValue = !this.collapsedValue
  }

  collapsedValueChanged() {
    if (this._loadingStoredState) {
      return
    }

    const value = String(this.collapsedValue)
    this.writeStoredValue(value)
    this.syncUI()
  }

  readStoredValue() {
    const key = this.storageKeyValue

    try {
      const value = window.localStorage.getItem(key)
      if (value !== null) return value
    } catch {
      // localStorage may be disabled
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
  }

  writeStoredValue(value) {
    const key = this.storageKeyValue

    try {
      window.localStorage.setItem(key, value)
    } catch {
      // localStorage may be disabled
    }

    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`
  }

  syncUI() {
    this.element.dataset.sidebarCollapsedValue = String(this.collapsedValue)

    if (this.hasToggleIconTarget) {
      const iconName = this.collapsedValue ? "chevron-right" : "chevron-left"
      this.toggleIconTarget.innerHTML = iconSvg(iconName, "h-5 w-5")
    }

    if (this.hasToggleButtonTarget) {
      this.toggleButtonTarget.setAttribute("aria-expanded", String(!this.collapsedValue))
    }
  }
}
