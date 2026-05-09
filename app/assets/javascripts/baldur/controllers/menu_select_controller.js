import { Controller } from "@hotwired/stimulus";
import { queryAll, addClass, removeClass, toggleClass } from "baldur/lib/dom-helpers";
import { updateAriaExpanded, updateAriaChecked } from "baldur/lib/focus-management";
import { smoothScroll } from "baldur/lib/animation-helpers";

export default class MenuSelectController extends Controller {
  static targets = ["trigger", "list", "input", "label"];
  static values = {
    typeaheadTimeout: { type: Number, default: 600 }
  };

  connect() {
    this.element.__stimulusController = this;
    this.element.__menuSelectSync = this.syncValue.bind(this);
    this.typeaheadState = { query: "", timeout: null };
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.listElement = this.hasListTarget ? this.listTarget : null;
    this.listPlaceholder = null;
    this.listOriginalParent = null;
    this.listOriginalNextSibling = null;
    this.init();
  }

  init() {
    if (this.hasTriggerTarget && this.listElement && this.hasInputTarget) {
      this.setupTrigger();
      this.setupMenuSelection();
      this.attachDocumentClose();
      this.syncOptions();
    }
  }

  setupTrigger() {
    this.triggerTarget.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleOpen();
    });
  }

  toggleOpen() {
    if (this.element.classList.contains("is-open")) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (MenuSelectController.activeMenu && MenuSelectController.activeMenu !== this.element) {
      MenuSelectController.activeMenu.__stimulusController?.close();
    }

    this.resetPlacement();
    this.portalListIfNeeded();
    addClass(this.element, "is-open");
    updateAriaExpanded(this.triggerTarget, true);
    MenuSelectController.activeMenu = this.element;
    this.toggleOverflowContainer(true);
    this.attachViewportListeners();
    requestAnimationFrame(() => this.applyBestPlacement());
  }

  close() {
    removeClass(this.element, "is-open");
    updateAriaExpanded(this.triggerTarget, false);
    this.resetTypeahead();
    this.detachViewportListeners();
    this.toggleOverflowContainer(false);
    this.resetPlacement();
    this.restorePortaledList();
    if (MenuSelectController.activeMenu === this.element) {
      MenuSelectController.activeMenu = null;
    }
  }

  setupMenuSelection() {
    this.listElement.addEventListener("click", (e) => {
      const option = e.target.closest("[data-menu-select-option]");
      if (!option || option.dataset.disabled === "true") return;

      e.preventDefault();
      const value = option.dataset.value;
      const label = option.dataset.label || option.textContent.trim();
      this.syncValue(value, label, true);
      this.close();
    });

    this.element.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.close();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.length === 1 && e.key.trim().length) {
        this.handleTypeahead(e.key);
        e.preventDefault();
      }

      if (e.key === " ") {
        this.handleTypeahead(" ");
        e.preventDefault();
      }
    });
  }

  handleTypeahead(char) {
    if (!char) return;

    this.typeaheadState.query += char.toLowerCase();

    if (this.typeaheadState.timeout) {
      clearTimeout(this.typeaheadState.timeout);
    }

    this.typeaheadState.timeout = setTimeout(() => {
      this.typeaheadState.query = "";
    }, this.typeaheadTimeoutValue);

    if (!this.element.classList.contains("is-open")) {
      this.triggerTarget.click();
    }

    const match = this.findMatchInOptions(this.typeaheadState.query);
    if (!match && this.typeaheadState.query.length > 1) {
      const singleCharMatch = this.findMatchInOptions(char.toLowerCase());
      if (singleCharMatch) {
        this.applyMatch(singleCharMatch);
      }
    } else if (match) {
      this.applyMatch(match);
    }
  }

  findMatchInOptions(query) {
    if (!query) return null;

    const normalized = query.toLowerCase();
    const options = queryAll("[data-menu-select-option]", this.listElement);

    for (const option of options) {
      if (option.dataset.disabled === "true") continue;

      const label = (option.dataset.label || option.textContent || "").toLowerCase();
      if (label.indexOf(normalized) === 0) {
        return option;
      }
    }

    return null;
  }

  applyMatch(option) {
    const value = option.dataset.value;
    const label = option.dataset.label || option.textContent.trim();
    this.syncValue(value, label, true);
    smoothScroll(option, { block: "nearest" });
  }

  syncOptions(value = null, label = null, emitEvents = false) {
    const newValue = value ?? this.inputTarget.value;
    this.inputTarget.value = newValue;

    const options = queryAll("[data-menu-select-option]", this.listElement);
    let activeOption = null;

    options.forEach((option) => {
      const isSelected = option.dataset.value === newValue && option.dataset.disabled !== "true";
      if (isSelected) activeOption = option;
      toggleClass(option, "is-selected", isSelected);
      updateAriaChecked(option, isSelected);
    });

    const computedLabel = label || (activeOption && (activeOption.dataset.label || activeOption.textContent.trim()));
    if (this.hasLabelTarget && computedLabel) {
      this.labelTarget.textContent = computedLabel;
    }

    if (emitEvents) {
      this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }));
      this.inputTarget.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  syncValue(value, label = null, emitEvents = false) {
    this.syncOptions(value, label, emitEvents);
  }

  resetTypeahead() {
    this.typeaheadState.query = "";
    if (this.typeaheadState.timeout) {
      clearTimeout(this.typeaheadState.timeout);
      this.typeaheadState.timeout = null;
    }
  }

  handleViewportChange(event) {
    if (!this.element.classList.contains("is-open")) return;
    if (this.shouldIgnoreViewportEvent(event)) return;
    requestAnimationFrame(() => this.applyBestPlacement());
  }

  attachViewportListeners() {
    window.addEventListener("resize", this.handleViewportChange);
    window.addEventListener("scroll", this.handleViewportChange, true);
  }

  detachViewportListeners() {
    window.removeEventListener("resize", this.handleViewportChange);
    window.removeEventListener("scroll", this.handleViewportChange, true);
  }

  applyBestPlacement() {
    if (!this.hasTriggerTarget || !this.listElement) return;

    const viewportPadding = 8;
    const menuGap = parseFloat(getComputedStyle(this.element).getPropertyValue("--space-2")) || 8;
    const triggerRect = this.triggerTarget.getBoundingClientRect();
    const list = this.listElement;
    const preferredHeight = Math.min(list.scrollHeight || 0, 320, window.innerHeight * 0.5);
    const availableBelow = Math.max(window.innerHeight - triggerRect.bottom - viewportPadding - menuGap, 0);
    const availableAbove = Math.max(triggerRect.top - viewportPadding - menuGap, 0);

    let placement = "bottom";
    if (preferredHeight > availableBelow && availableAbove > availableBelow) {
      placement = "top";
    }

    const availableHeight = placement === "top" ? availableAbove : availableBelow;
    const maxHeight = Math.floor(Math.min(Math.max(availableHeight, 0), 320, window.innerHeight * 0.5));

    this.element.dataset.menuPlacement = placement;

    if (this.isPortaled()) {
      this.positionPortaledList({
        triggerRect,
        placement,
        maxHeight,
        viewportPadding,
        menuGap
      });
      return;
    }

    if (maxHeight > 0) {
      list.style.maxHeight = `${maxHeight}px`;
    }

    list.style.left = "0px";
    let rect = list.getBoundingClientRect();
    const minLeft = viewportPadding;
    const maxRight = window.innerWidth - viewportPadding;

    if (rect.left < minLeft) {
      list.style.left = `${Math.ceil(minLeft - rect.left)}px`;
      rect = list.getBoundingClientRect();
    }

    if (rect.right > maxRight) {
      list.style.left = `${Math.floor(parseFloat(list.style.left || "0") - (rect.right - maxRight))}px`;
    }
  }

  positionPortaledList({ triggerRect, placement, maxHeight, viewportPadding, menuGap }) {
    const list = this.listElement;
    const maxWidth = Math.min(window.innerWidth - (viewportPadding * 2), 352);

    list.style.position = "fixed";
    list.style.right = "auto";
    list.style.bottom = "auto";
    list.style.display = "block";
    list.style.pointerEvents = "auto";
    list.style.opacity = "1";
    list.style.transform = "none";
    list.style.transformOrigin = placement === "top" ? "bottom left" : "top left";
    list.style.zIndex = "10050";
    list.style.maxHeight = maxHeight > 0 ? `${maxHeight}px` : "";
    list.style.maxWidth = `${Math.floor(maxWidth)}px`;
    list.style.minWidth = `${Math.ceil(triggerRect.width)}px`;
    list.style.width = `${Math.ceil(Math.max(triggerRect.width, Math.min(list.scrollWidth || triggerRect.width, maxWidth)))}px`;

    const measuredRect = list.getBoundingClientRect();
    const unclampedLeft = triggerRect.left;
    const left = Math.min(
      Math.max(unclampedLeft, viewportPadding),
      Math.max(viewportPadding, window.innerWidth - measuredRect.width - viewportPadding)
    );
    const top = placement === "top"
      ? Math.max(viewportPadding, triggerRect.top - measuredRect.height - menuGap)
      : Math.min(window.innerHeight - measuredRect.height - viewportPadding, triggerRect.bottom + menuGap);

    list.style.left = `${Math.round(left)}px`;
    list.style.top = `${Math.round(top)}px`;
  }

  resetPlacement() {
    if (!this.listElement) return;

    this.element.dataset.menuPlacement = "bottom";

    const list = this.listElement;
    list.style.left = "";
    list.style.top = "";
    list.style.right = "";
    list.style.bottom = "";
    list.style.width = "";
    list.style.minWidth = "";
    list.style.maxWidth = "";
    list.style.maxHeight = "";
    list.style.position = "";
    list.style.display = "";
    list.style.pointerEvents = "";
    list.style.opacity = "";
    list.style.transform = "";
    list.style.transformOrigin = "";
    list.style.zIndex = "";
  }

  toggleOverflowContainer(isOpen) {
    const tableCard = this.element.closest(".table-card");
    if (!tableCard) return;

    toggleClass(tableCard, "has-open-menu", isOpen);
  }

  attachDocumentClose() {
    this.documentClickHandler = (e) => {
      if (!MenuSelectController.activeMenu) return;
      if (MenuSelectController.activeMenu !== this.element) return;
      if (this.element.contains(e.target)) return;
      if (this.listElement?.contains(e.target)) return;

      this.close();
    };
    document.addEventListener("click", this.documentClickHandler);
  }

  disconnect() {
    this.close();
    if (this.documentClickHandler) {
      document.removeEventListener("click", this.documentClickHandler);
      this.documentClickHandler = null;
    }
    delete this.element.__stimulusController;
    delete this.element.__menuSelectSync;
  }

  isPortaled() {
    return this.listElement?.dataset.menuSelectPortaled === "true";
  }

  shouldPortalList() {
    return this.element.closest("[data-modal]") !== null;
  }

  portalListIfNeeded() {
    if (!this.shouldPortalList() || this.isPortaled() || !this.listElement) return;

    this.listOriginalParent = this.listElement.parentNode;
    this.listOriginalNextSibling = this.listElement.nextSibling;
    this.listPlaceholder = document.createComment("menu-select-placeholder");
    this.listOriginalParent.insertBefore(this.listPlaceholder, this.listElement);
    document.body.appendChild(this.listElement);
    this.listElement.dataset.menuSelectPortaled = "true";
  }

  restorePortaledList() {
    if (!this.isPortaled() || !this.listOriginalParent || !this.listElement) return;

    if (this.listOriginalNextSibling && this.listOriginalNextSibling.parentNode === this.listOriginalParent) {
      this.listOriginalParent.insertBefore(this.listElement, this.listOriginalNextSibling);
    } else if (this.listPlaceholder?.parentNode === this.listOriginalParent) {
      this.listOriginalParent.insertBefore(this.listElement, this.listPlaceholder);
    } else {
      this.listOriginalParent.appendChild(this.listElement);
    }

    delete this.listElement.dataset.menuSelectPortaled;

    if (this.listPlaceholder?.parentNode) {
      this.listPlaceholder.parentNode.removeChild(this.listPlaceholder);
    }

    this.listPlaceholder = null;
    this.listOriginalParent = null;
    this.listOriginalNextSibling = null;
  }

  shouldIgnoreViewportEvent(event) {
    if (!this.isPortaled()) return false;
    if (!event || event.type !== "scroll" || !this.listElement) return false;

    const target = event.target;
    if (!target) return false;

    return target === this.listElement || this.listElement.contains(target);
  }
}

MenuSelectController.activeMenu = null;
