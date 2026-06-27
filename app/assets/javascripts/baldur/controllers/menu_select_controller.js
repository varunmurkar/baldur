import { Controller } from "@hotwired/stimulus";
import { queryAll, addClass, removeClass, toggleClass } from "baldur/lib/dom-helpers";
import { updateAriaExpanded, updateAriaChecked } from "baldur/lib/focus-management";
import { smoothScroll, getMotionTimings } from "baldur/lib/animation-helpers";

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
    this.activeOptionIndex = -1;
    this.closeTimeout = null;
    this.timings = getMotionTimings();
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

    this.triggerTarget.addEventListener("keydown", (e) => this.handleTriggerKeydown(e));
  }

  toggleOpen() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  isOpen() {
    const state = this.listElement?.dataset.menuState;
    return state === "open" || state === "opening";
  }

  isClosed() {
    const state = this.listElement?.dataset.menuState;
    return !state || state === "closed";
  }

  open() {
    this.cancelClose();

    if (MenuSelectController.activeMenu && MenuSelectController.activeMenu !== this.element) {
      MenuSelectController.activeMenu.__stimulusController?.close();
    }

    this.resetPlacement();
    this.portalListIfNeeded();
    addClass(this.element, "is-open");
    this.listElement.removeAttribute("hidden");
    this.setListState("closed");
    updateAriaExpanded(this.triggerTarget, true);
    MenuSelectController.activeMenu = this.element;
    this.toggleOverflowContainer(true);
    this.attachViewportListeners();
    this.setActiveOptionToSelected();

    this.applyBestPlacement();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setListState("open");
      });
    });
  }

  close() {
    this.cancelClose();

    if (this.listElement && (this.listElement.dataset.menuState === "open" || this.listElement.dataset.menuState === "opening")) {
      this.startCloseAnimation();
    } else {
      this.finalizeClose();
    }
  }

  startCloseAnimation() {
    this.cancelClose();
    updateAriaExpanded(this.triggerTarget, false);
    this.detachViewportListeners();
    this.toggleOverflowContainer(false);
    this.setListState("closing");
    this.closeTimeout = setTimeout(() => this.finalizeClose(), this.motionDuration());
  }

  finalizeClose() {
    this.cancelClose();
    removeClass(this.element, "is-open");
    this.listElement?.setAttribute("hidden", "");
    this.setListState("closed");
    this.resetTypeahead();
    this.resetPlacement();
    this.restorePortaledList();
    if (MenuSelectController.activeMenu === this.element) {
      MenuSelectController.activeMenu = null;
    }
  }

  cancelClose() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  setListState(state) {
    if (!this.listElement) return;
    this.listElement.dataset.menuState = state;
    this.element.dataset.menuState = state;
  }

  motionDuration() {
    if (!this.listElement) return 200;
    const computed = window.getComputedStyle(this.listElement);
    const raw = computed.getPropertyValue("--motion-duration-short4");
    if (!raw) return 200;
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? 200 : Math.max(0, parsed);
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
      this.triggerTarget.focus();
    });

    this.listElement.addEventListener("keydown", (e) => this.handleListKeydown(e));
  }

  getOptions() {
    return queryAll("[data-menu-select-option]", this.listElement);
  }

  enabledOptions() {
    return this.getOptions().filter((option) => option.dataset.disabled !== "true");
  }

  activeOption() {
    const options = this.enabledOptions();
    if (this.activeOptionIndex < 0 || this.activeOptionIndex >= options.length) return null;
    return options[this.activeOptionIndex];
  }

  setActiveOption(index, scroll = true) {
    const options = this.enabledOptions();
    if (options.length === 0) return;

    this.activeOptionIndex = Math.max(0, Math.min(index, options.length - 1));
    this.getOptions().forEach((option) => removeClass(option, "is-active"));

    const active = options[this.activeOptionIndex];
    addClass(active, "is-active");
    this.triggerTarget.setAttribute("aria-activedescendant", active.id);
    if (scroll) smoothScroll(active, { block: "nearest" });
  }

  setActiveOptionToSelected() {
    const options = this.enabledOptions();
    const currentValue = this.inputTarget.value;
    const selectedIndex = options.findIndex((option) => option.dataset.value === currentValue);
    this.setActiveOption(selectedIndex >= 0 ? selectedIndex : 0, false);
  }

  clearActiveOption() {
    this.activeOptionIndex = -1;
    this.getOptions().forEach((option) => removeClass(option, "is-active"));
    this.triggerTarget.removeAttribute("aria-activedescendant");
  }

  moveActiveOption(step) {
    const options = this.enabledOptions();
    if (options.length === 0) return;

    if (this.activeOptionIndex < 0) {
      this.setActiveOption(step > 0 ? 0 : options.length - 1);
      return;
    }

    let nextIndex = this.activeOptionIndex + step;
    nextIndex = Math.max(0, Math.min(nextIndex, options.length - 1));
    this.setActiveOption(nextIndex);
  }

  selectActiveOption() {
    const active = this.activeOption();
    if (!active) return;

    const value = active.dataset.value;
    const label = active.dataset.label || active.textContent.trim();
    this.syncValue(value, label, true);
    this.close();
    this.triggerTarget.focus();
  }

  handleTriggerKeydown(e) {
    if (e.altKey) return;

    const isOpen = this.isOpen();

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          this.open();
        }
        this.moveActiveOption(e.key === "ArrowDown" ? 1 : -1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          this.selectActiveOption();
        } else {
          this.open();
        }
        break;
      case "Home":
        e.preventDefault();
        if (!isOpen) this.open();
        this.setActiveOption(0);
        break;
      case "End":
        e.preventDefault();
        if (!isOpen) this.open();
        this.setActiveOption(this.enabledOptions().length - 1);
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          this.close();
          this.triggerTarget.focus();
        }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.handleTypeahead(e.key);
        }
        break;
    }
  }

  handleListKeydown(e) {
    if (e.altKey) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.moveActiveOption(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.moveActiveOption(-1);
        break;
      case "Home":
        e.preventDefault();
        this.setActiveOption(0);
        break;
      case "End":
        e.preventDefault();
        this.setActiveOption(this.enabledOptions().length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.selectActiveOption();
        break;
      case "Escape":
        e.preventDefault();
        this.close();
        this.triggerTarget.focus();
        break;
      case "Tab":
        e.preventDefault();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.handleTypeahead(e.key);
        }
        break;
    }
  }

  handleTypeahead(char) {
    if (!char) return;

    if (!this.isOpen()) {
      this.open();
    }

    this.typeaheadState.query += char.toLowerCase();

    if (this.typeaheadState.timeout) {
      clearTimeout(this.typeaheadState.timeout);
    }

    this.typeaheadState.timeout = setTimeout(() => {
      this.typeaheadState.query = "";
    }, this.typeaheadTimeoutValue);

    const match = this.findMatchInOptions(this.typeaheadState.query);
    if (!match && this.typeaheadState.query.length > 1) {
      const singleCharMatch = this.findMatchInOptions(char.toLowerCase());
      if (singleCharMatch) {
        this.applyMatch(singleCharMatch, false);
      }
    } else if (match) {
      this.applyMatch(match, false);
    }
  }

  findMatchInOptions(query) {
    if (!query) return null;

    const normalized = query.toLowerCase();
    const options = this.enabledOptions();

    for (const option of options) {
      const label = (option.dataset.label || option.textContent || "").toLowerCase();
      if (label.indexOf(normalized) === 0) {
        return option;
      }
    }

    return null;
  }

  applyMatch(option, select = true) {
    if (select) {
      const value = option.dataset.value;
      const label = option.dataset.label || option.textContent.trim();
      this.syncValue(value, label, true);
    }
    const options = this.enabledOptions();
    const index = options.indexOf(option);
    if (index >= 0) {
      this.setActiveOption(index);
    }
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
    if (!this.isOpen()) return;
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
    this.cancelClose();
    this.finalizeClose();
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
    return this.findClippingAncestor(this.element) !== null;
  }

  findClippingAncestor(element) {
    let node = element.parentElement;
    while (node) {
      const style = window.getComputedStyle(node);
      const overflowX = style.overflowX;
      const overflowY = style.overflowY;
      if (
        (overflowX !== "visible" && overflowX !== "clip") ||
        (overflowY !== "visible" && overflowY !== "clip")
      ) {
        return node;
      }
      if (node.tagName === "BODY" || node.tagName === "HTML") break;
      node = node.parentElement;
    }
    return null;
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
