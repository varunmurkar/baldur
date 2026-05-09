/**
 * Local Storage Helpers
 * Safe wrappers for localStorage with fallback handling
 */

export const getFromStorage = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ?? defaultValue;
  } catch (error) {
    console.warn(`Unable to read from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to write to localStorage:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Unable to remove from localStorage:`, error);
    return false;
  }
};

export const getSystemPreference = (preference, options = []) => {
  if (!window.matchMedia) return options[0] || null;

  try {
    if (preference === "color-scheme") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  } catch (error) {
    console.warn(`Unable to query system preference:`, error);
  }

  return options[0] || null;
};
