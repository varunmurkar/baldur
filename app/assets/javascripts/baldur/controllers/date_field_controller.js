import { Controller } from "@hotwired/stimulus";
import { query } from "baldur/lib/dom-helpers";
import { setFieldValidationMessage } from "baldur/lib/field-validation-helpers";
import { iconSvg } from "baldur/lib/lucide";
import {
  parseDisplayDate,
  formatDateForDisplay
} from "baldur/lib/formatting-helpers";

export default class DateFieldController extends Controller {
  static targets = ["display", "native", "toggle"];

  connect() {
    if (!this.hasDisplayTarget || !this.hasNativeTarget) return;

    this.setupFieldNames();
    this.syncFromNative();
    this.attachEventListeners();
    this.buildPicker();
  }

  setupFieldNames() {
    const actualName = this.nativeTarget.dataset.dateFieldName || this.displayTarget.name;

    if (actualName) {
      this.nativeTarget.name = actualName;
      if (this.displayTarget.name === actualName) {
        this.displayTarget.removeAttribute("name");
      }
    }
  }

  attachEventListeners() {
    this.displayTarget.addEventListener("blur", () => this.syncFromDisplay());
    this.displayTarget.addEventListener("change", () => this.syncFromDisplay());
    this.displayTarget.addEventListener("paste", this.preventPaste);
    this.displayTarget.addEventListener("input", (event) => {
      if (event.isTrusted) {
        this.applyDateMask(this.displayTarget);
        const wrapper = this.element;
        if (wrapper.classList.contains("is-invalid")) {
          this.updateSupport("");
        }
      }
    });

    this.nativeTarget.addEventListener("change", () => this.syncFromNative({ emit: true }));

    if (this.hasToggleTarget) {
      this.toggleTarget.addEventListener("click", (e) => {
        e.preventDefault();
        this.togglePicker();
      });
      this.toggleTarget.setAttribute("aria-expanded", "false");
    }

    document.addEventListener("mousedown", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleGlobalKeydown);
  }

  disconnect() {
    document.removeEventListener("mousedown", this.handleDocumentClick);
    document.removeEventListener("keydown", this.handleGlobalKeydown);
    this.displayTarget?.removeEventListener("paste", this.preventPaste);
  }

  syncFromNative(options = {}) {
    const isoValue = this.nativeTarget.value || "";
    this.displayTarget.value = isoValue ? formatDateForDisplay(isoValue) : "";
    this.updateSupport("");

    if (options.emit) {
      this.displayTarget.dispatchEvent(new Event("input", { bubbles: true }));
      this.displayTarget.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  syncFromDisplay() {
    const text = this.displayTarget.value || "";

    if (!text.trim()) {
      this.nativeTarget.value = "";
      this.updateSupport("");
      return;
    }

    const iso = parseDisplayDate(text);
    if (!iso) {
      const label = this.displayTarget.dataset.fieldLabel || "Date";
      this.updateSupport(`${label} must be a valid date (YYYY-MM-DD)`);
      return;
    }

    const date = this.dateFromIso(iso);
    const violation = this.dateConstraintViolation(date);
    if (violation) {
      const label = this.displayTarget.dataset.fieldLabel || "Date";
      const direction = violation === "beforeMin" ? "past" : "future";
      this.updateSupport(`${label} cannot be in the ${direction}`);
      return;
    }

    this.nativeTarget.value = iso;
    this.updateSupport("");
  }

  updateSupport(message) {
    setFieldValidationMessage(this.element, message);
  }

  applyDateMask(field) {
    if (!field) return;
    const raw = field.value || "";
    const selection = typeof field.selectionStart === "number" ? field.selectionStart : raw.length;
    const digitsBeforeCursor = raw.slice(0, selection).replace(/\D/g, "").length;
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    let output = "";
    let caret = 0;
    digits.split("").forEach((char, index) => {
      if (index === 4 || index === 6) output += "-";
      output += char;
      if (index + 1 === digitsBeforeCursor) caret = output.length;
    });

    if (digitsBeforeCursor >= digits.length) {
      caret = output.length;
    }

    field.value = output;
    if (field.setSelectionRange) {
      const pos = Math.min(caret, output.length);
      field.setSelectionRange(pos, pos);
    }
  }

  // --- Picker UI ---

  buildPicker() {
    const initialDate = this.parseNativeValue() || new Date();
    const clampedDate = this.clampDateToBounds(initialDate);
    this.currentViewDate = clampedDate;
    this.activeDate = clampedDate;

    this.picker = document.createElement("div");
    this.picker.className = "date-picker";
    this.picker.setAttribute("role", "dialog");
    this.picker.setAttribute("aria-modal", "true");
    this.picker.setAttribute("aria-label", "Choose date");
    this.picker.hidden = true;

    const header = document.createElement("div");
    header.className = "date-picker__header";

    const dateControls = document.createElement("div");
    dateControls.className = "date-picker__controls";

    this.monthSelect = document.createElement("select");
    this.monthSelect.className = "date-picker__month";
    this.monthSelect.setAttribute("aria-label", "Select month");
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleDateString(undefined, { month: "short" })
    );
    monthNames.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = name;
      this.monthSelect.append(option);
    });
    this.monthSelect.addEventListener("change", (event) => {
      const month = Number(event.target.value);
      this.changeMonthTo(month);
    });

    this.yearInput = document.createElement("input");
    this.yearInput.type = "number";
    this.yearInput.inputMode = "numeric";
    this.yearInput.className = "date-picker__year";
    this.yearInput.setAttribute("aria-label", "Select year");
    this.yearInput.setAttribute("min", "1900");
    this.yearInput.setAttribute("max", "2100");
    this.yearInput.addEventListener("change", () => this.changeYear());
    this.yearInput.addEventListener("blur", () => this.changeYear());
    this.yearInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.changeYear();
      }
    });

    dateControls.append(this.monthSelect, this.yearInput);

    this.prevButton = document.createElement("button");
    this.prevButton.type = "button";
    this.prevButton.className = "date-picker__nav";
    this.prevButton.setAttribute("aria-label", "Previous month");
    this.prevButton.innerHTML = iconSvg("chevron-left", "h-4 w-4");
    this.prevButton.addEventListener("click", () => this.changeMonth(-1));

    this.nextButton = document.createElement("button");
    this.nextButton.type = "button";
    this.nextButton.className = "date-picker__nav";
    this.nextButton.setAttribute("aria-label", "Next month");
    this.nextButton.innerHTML = iconSvg("chevron-right", "h-4 w-4");
    this.nextButton.addEventListener("click", () => this.changeMonth(1));

    this.title = document.createElement("div");
    this.title.className = "date-picker__title";

    header.append(this.prevButton, dateControls, this.nextButton);
    this.picker.append(header);
    const titleRow = document.createElement("div");
    titleRow.className = "date-picker__title-row";
    titleRow.append(this.title);
    this.picker.append(titleRow);

    const weekdays = document.createElement("div");
    weekdays.className = "date-picker__weekdays";
    const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    weekdayLabels.forEach((label) => {
      const day = document.createElement("span");
      day.textContent = label;
      day.setAttribute("aria-hidden", "true");
      weekdays.append(day);
    });
    this.picker.append(weekdays);

    this.grid = document.createElement("div");
    this.grid.className = "date-picker__grid";
    this.grid.setAttribute("role", "grid");
    this.picker.append(this.grid);

    this.element.append(this.picker);
    this.renderCalendar();
  }

  togglePicker() {
    if (this.picker.hidden) {
      this.openPicker();
    } else {
      this.closePicker();
    }
  }

  openPicker() {
    const initialDate = this.parseNativeValue() || new Date();
    const clampedDate = this.clampDateToBounds(initialDate);
    this.currentViewDate = clampedDate;
    this.activeDate = clampedDate;
    this.renderCalendar();
    this.picker.hidden = false;
    this.element.classList.add("is-open");
    if (this.hasToggleTarget) {
      this.toggleTarget.setAttribute("aria-expanded", "true");
    }
    this.focusActiveDay();
  }

  closePicker() {
    if (this.picker.hidden) return;
    this.picker.hidden = true;
    this.element.classList.remove("is-open");
    if (this.hasToggleTarget) {
      this.toggleTarget.setAttribute("aria-expanded", "false");
    }
  }

  renderCalendar() {
    const viewYear = this.currentViewDate.getFullYear();
    const viewMonth = this.currentViewDate.getMonth();
    const selectedIso = this.nativeTarget.value;
    const selectedDate = selectedIso ? this.dateFromIso(selectedIso) : null;
    const today = new Date();

    this.title.textContent = this.currentViewDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });
    this.monthSelect.value = this.currentViewDate.getMonth().toString();
    this.yearInput.value = this.currentViewDate.getFullYear().toString();

    this.grid.innerHTML = "";
    const startOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = startOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    for (let cell = 0; cell < totalCells; cell += 1) {
      const dayNumber = cell - startWeekday + 1;
      const dayButton = document.createElement("button");
      dayButton.type = "button";
      dayButton.className = "date-picker__day";
      dayButton.setAttribute("role", "gridcell");

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        dayButton.classList.add("is-outside");
        dayButton.tabIndex = -1;
        this.grid.append(dayButton);
        continue;
      }

      const cellDate = new Date(viewYear, viewMonth, dayNumber);
      const isoValue = this.isoFromDate(cellDate);
      const isToday = cellDate.toDateString() === today.toDateString();
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
      const isActive = cellDate.toDateString() === this.activeDate.toDateString();
      const isDisabled = this.isDateDisabled(cellDate);

      dayButton.textContent = dayNumber.toString();
      dayButton.dataset.dateValue = isoValue;
      dayButton.setAttribute("aria-label", cellDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }));
      dayButton.setAttribute("aria-selected", isSelected ? "true" : "false");
      dayButton.tabIndex = (isActive && !isDisabled) ? 0 : -1;
      dayButton.disabled = isDisabled;

      if (isSelected) dayButton.classList.add("is-selected");
      if (isToday) dayButton.classList.add("is-today");
      if (isDisabled) dayButton.classList.add("is-disabled");

      dayButton.addEventListener("click", () => this.selectDate(cellDate));
      dayButton.addEventListener("keydown", (event) => this.handleDayKeydown(event, cellDate));

      this.grid.append(dayButton);
    }
  }

  handleDayKeydown(event, cellDate) {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      event.preventDefault();
      const delta = key === "ArrowUp" ? -7 : key === "ArrowDown" ? 7 : key === "ArrowLeft" ? -1 : 1;
      this.moveActiveByDays(delta);
    } else if (key === "PageUp") {
      event.preventDefault();
      this.changeMonth(-1, { keepDay: true });
    } else if (key === "PageDown") {
      event.preventDefault();
      this.changeMonth(1, { keepDay: true });
    } else if (key === "Home") {
      event.preventDefault();
      this.moveActiveToStartOfWeek();
    } else if (key === "End") {
      event.preventDefault();
      this.moveActiveToEndOfWeek();
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.selectDate(cellDate);
    } else if (key === "Escape") {
      event.preventDefault();
      this.closePicker();
      this.toggleTarget?.focus();
    }
  }

  handleDocumentClick = (event) => {
    if (this.picker.hidden) return;
    if (this.element.contains(event.target)) return;
    this.closePicker();
  };

  handleGlobalKeydown = (event) => {
    if (event.key === "Tab" && !this.picker.hidden) {
      this.closePicker();
    }
  };

  moveActiveByDays(delta) {
    const tentative = new Date(this.activeDate);
    tentative.setDate(this.activeDate.getDate() + delta);

    const next = this.clampDateToBounds(tentative);
    if (next.toDateString() === this.activeDate.toDateString()) return;

    this.activeDate = next;
    this.currentViewDate = new Date(next.getFullYear(), next.getMonth(), 1);
    this.renderCalendar();
    this.focusActiveDay();
  }

  moveActiveToStartOfWeek() {
    const day = this.activeDate.getDay();
    this.moveActiveByDays(-day);
  }

  moveActiveToEndOfWeek() {
    const day = this.activeDate.getDay();
    this.moveActiveByDays(6 - day);
  }

  changeMonth(delta, options = {}) {
    const nextMonth = new Date(this.currentViewDate);
    nextMonth.setMonth(this.currentViewDate.getMonth() + delta);

    const day = options.keepDay ? this.activeDate.getDate() : 1;
    let recalculated = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);

    if (options.keepDay && this.isDateDisabled(recalculated)) {
      recalculated = this.findFirstEnabledDateInMonth(nextMonth.getFullYear(), nextMonth.getMonth());
    }

    const clamped = this.clampDateToBounds(recalculated);
    this.activeDate = clamped;
    this.currentViewDate = new Date(clamped.getFullYear(), clamped.getMonth(), 1);
    this.renderCalendar();
    this.focusActiveDay();
  }

  changeMonthTo(monthIndex) {
    if (Number.isNaN(monthIndex)) return;
    const next = new Date(this.currentViewDate);
    next.setMonth(monthIndex);
    const adjusted = this.findFirstEnabledDateInMonth(next.getFullYear(), monthIndex);
    const clamped = this.clampDateToBounds(adjusted);
    this.activeDate = clamped;
    this.currentViewDate = new Date(clamped.getFullYear(), clamped.getMonth(), 1);
    this.renderCalendar();
    this.focusActiveDay();
  }

  changeYear() {
    const parsed = parseInt(this.yearInput.value, 10);
    if (Number.isNaN(parsed)) return;
    const clampedYear = Math.min(Math.max(parsed, 1900), 2100);
    const next = new Date(this.currentViewDate);
    next.setFullYear(clampedYear);
    const adjusted = this.findFirstEnabledDateInMonth(next.getFullYear(), next.getMonth());
    const clamped = this.clampDateToBounds(adjusted);
    this.activeDate = clamped;
    this.currentViewDate = new Date(clamped.getFullYear(), clamped.getMonth(), 1);
    this.yearInput.value = clampedYear.toString();
    this.renderCalendar();
    this.focusActiveDay();
  }

  focusActiveDay() {
    const iso = this.isoFromDate(this.activeDate);
    const button = query(`[data-date-value="${iso}"]`, this.grid);
    if (button && !button.disabled) {
      button.focus({ preventScroll: true });
    } else {
      const firstEnabled = query("button:not(.is-outside):not(:disabled)", this.grid);
      firstEnabled?.focus({ preventScroll: true });
    }
  }

  findFirstEnabledDateInMonth(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const testDate = new Date(year, month, day);
      if (!this.isDateDisabled(testDate)) {
        return testDate;
      }
    }

    const fallback = new Date(year, month, 1);
    return this.clampDateToBounds(fallback);
  }

  parseNativeValue() {
    const value = this.nativeTarget.value;
    if (!value) return null;
    return this.dateFromIso(value);
  }

  selectDate(date) {
    if (!date || Number.isNaN(date.getTime())) return;
    if (this.isDateDisabled(date)) return;
    const isoValue = this.isoFromDate(date);
    this.nativeTarget.value = isoValue;
    this.syncFromNative({ emit: true });
    this.closePicker();
    this.toggleTarget?.focus();
  }

  dateFromIso(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  isoFromDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  getMinDate() {
    const minDateAttr = this.nativeTarget.getAttribute("min");
    if (!minDateAttr) return null;
    return this.dateFromIso(minDateAttr);
  }

  getMaxDate() {
    const maxDateAttr = this.nativeTarget.getAttribute("max");
    if (!maxDateAttr) return null;
    return this.dateFromIso(maxDateAttr);
  }

  dateConstraintViolation(date) {
    if (!date || Number.isNaN(date.getTime())) return null;

    const compareDate = this.normalizeDate(date);

    const minDate = this.getMinDate();
    if (minDate) {
      const normalizedMin = this.normalizeDate(minDate);
      if (compareDate < normalizedMin) return "beforeMin";
    }

    const maxDate = this.getMaxDate();
    if (maxDate) {
      const normalizedMax = this.normalizeDate(maxDate);
      if (compareDate > normalizedMax) return "afterMax";
    }

    return null;
  }

  clampDateToBounds(date) {
    if (!date || Number.isNaN(date.getTime())) return date;

    const compareDate = this.normalizeDate(date);

    const minDate = this.getMinDate();
    if (minDate) {
      const normalizedMin = this.normalizeDate(minDate);
      if (compareDate < normalizedMin) return normalizedMin;
    }

    const maxDate = this.getMaxDate();
    if (maxDate) {
      const normalizedMax = this.normalizeDate(maxDate);
      if (compareDate > normalizedMax) return normalizedMax;
    }

    return compareDate;
  }

  isDateDisabled(date) {
    return !!this.dateConstraintViolation(date);
  }

  preventPaste = (event) => {
    event.preventDefault();
  };
}
