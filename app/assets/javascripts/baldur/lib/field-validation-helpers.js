import { query } from "baldur/lib/dom-helpers";

export function setFieldValidationMessage(fieldOrWrapper, message) {
  const wrapper = resolveFieldWrapper(fieldOrWrapper);
  if (!wrapper) return;

  const support = query("[data-field-support]", wrapper);

  if (message) {
    wrapper.classList.add("is-invalid");
    if (support) {
      support.textContent = message;
      support.removeAttribute("hidden");
    }
    return;
  }

  wrapper.classList.remove("is-invalid");
  if (!support) return;

  const defaultText = support.dataset.defaultSupport || "";
  support.textContent = defaultText;

  if (defaultText.length) {
    support.removeAttribute("hidden");
  } else {
    support.setAttribute("hidden", "hidden");
  }
}

function resolveFieldWrapper(fieldOrWrapper) {
  if (!fieldOrWrapper) return null;
  if (fieldOrWrapper.classList?.contains("field")) return fieldOrWrapper;
  if (typeof fieldOrWrapper.closest !== "function") return null;
  return fieldOrWrapper.closest(".field");
}
