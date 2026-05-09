import { iconSvg } from "baldur/lib/lucide";

const SNACKBAR_TITLES = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  notice: "Notice"
};

const SNACKBAR_ICONS = {
  success: "check-circle",
  error: "circle-alert",
  warning: "triangle-alert",
  notice: "info"
};

function ensureStack() {
  return document.querySelector("[data-baldur-snackbar-stack]");
}

function createSnackbarFromTemplate() {
  const template = document.querySelector("[data-baldur-snackbar-template]");
  const element = template?.content?.firstElementChild?.cloneNode(true);
  return element instanceof HTMLElement ? element : null;
}

export function showSnackbar({
  message,
  title,
  variant = "notice",
  dismissLabel = "Dismiss"
} = {}) {
  if (!message || !document?.body) return;

  const resolvedVariant = ["success", "error", "warning", "notice"].includes(variant) ? variant : "notice";
  const stack = ensureStack();
  const snackbar = createSnackbarFromTemplate();
  if (!stack || !snackbar) return;

  const titleText = title || SNACKBAR_TITLES[resolvedVariant] || SNACKBAR_TITLES.notice;
  const iconName = SNACKBAR_ICONS[resolvedVariant] || SNACKBAR_ICONS.notice;
  snackbar.className = `snackbar snackbar--${resolvedVariant}`;
  snackbar.dataset.snackbarVariant = resolvedVariant;
  snackbar.querySelector("[data-snackbar-icon]").innerHTML = iconSvg(iconName, "h-5 w-5");
  snackbar.querySelector("[data-snackbar-label]").textContent = titleText;
  snackbar.querySelector("[data-snackbar-message]").textContent = String(message);
  snackbar.querySelector("[data-snackbar-dismiss]").setAttribute("aria-label", dismissLabel);

  stack.appendChild(snackbar);
}
