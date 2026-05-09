/**
 * DOM Query & Manipulation Helpers
 * Reduces boilerplate and centralizes DOM patterns used across controllers
 */

export const queryAll = (selector, root = document) => {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return [];
  }
};

export const query = (selector, root = document) => {
  try {
    return root.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
};

export const delegateEvent = (element, eventType, selector, handler) => {
  element.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && element.contains(target)) {
      handler.call(target, event);
    }
  });
};

export const setAttrs = (element, attrs) => {
  if (!element) return;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
};

export const toggleClass = (element, className, force) => {
  if (!element) return;
  element.classList.toggle(className, force);
};

export const addClass = (element, ...classes) => {
  if (!element) return;
  element.classList.add(...classes);
};

export const removeClass = (element, ...classes) => {
  if (!element) return;
  element.classList.remove(...classes);
};

export const replaceClass = (element, oldClass, newClass) => {
  if (!element) return;
  removeClass(element, oldClass);
  addClass(element, newClass);
};

export const getDataset = (element, key) => {
  return element?.dataset?.[key];
};

export const setDataset = (element, key, value) => {
  if (!element) return;
  element.dataset[key] = value;
};

export const closest = (element, selector) => {
  return element?.closest(selector) || null;
};

export const matches = (element, selector) => {
  return element?.matches(selector) ?? false;
};
