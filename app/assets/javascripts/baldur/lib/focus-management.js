/**
 * Focus Management & Accessibility Helpers
 * Ensures proper focus traps and ARIA updates across controllers
 */

export const focusFirstFocusable = (container) => {
  if (!container) return;

  // Priority: autofocus > form inputs > buttons > any focusable
  const autofocus = container.querySelector("[data-modal-autofocus]");
  if (autofocus) {
    setTimeout(() => autofocus.focus(), 10);
    return;
  }

  const focusable = container.querySelector(
    "input, select, textarea, button, [href], [tabindex]"
  );
  if (focusable) {
    setTimeout(() => focusable.focus(), 10);
  }
};

export const createFocusTrap = (element, onEscape) => {
  const focusableElements = element.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && onEscape) {
      onEscape(event);
      return;
    }

    if (event.key !== "Tab") return;

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  element.addEventListener("keydown", handleKeyDown);

  return () => element.removeEventListener("keydown", handleKeyDown);
};

export const updateAriaLabel = (element, label) => {
  if (element) {
    element.setAttribute("aria-label", label);
  }
};

export const updateAriaExpanded = (element, expanded) => {
  if (element) {
    element.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
};

export const updateAriaHidden = (element, hidden) => {
  if (element) {
    element.setAttribute("aria-hidden", hidden ? "true" : "false");
  }
};

export const updateAriaChecked = (element, checked) => {
  if (element) {
    element.setAttribute("aria-checked", checked ? "true" : "false");
  }
};

export const announceToScreenReader = (message, role = "status") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", role);
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 3000);
};
