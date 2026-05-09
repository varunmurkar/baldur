/**
 * Animation & Motion Helpers
 * Consistent handling of transitions and timing across controllers
 */

// Fetch motion timing from design tokens
export const getMotionTimings = () => {
  try {
    const computed = window.getComputedStyle(document.documentElement);
    return {
      fadeIn: parseFloat(computed.getPropertyValue("--motion-duration-short3")) || 150,
      fadeOut: parseFloat(computed.getPropertyValue("--motion-duration-short2")) || 75,
      standard: parseFloat(computed.getPropertyValue("--motion-duration-medium1")) || 300
    };
  } catch (error) {
    return { fadeIn: 150, fadeOut: 75, standard: 300 };
  }
};

export const requestFrameCallback = (fn) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      fn();
      resolve();
    });
  });
};

export const debounceTimeout = (fn, delay) => {
  let timeoutId = null;
  return {
    call: () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fn, delay);
    },
    clear: () => clearTimeout(timeoutId),
    active: () => timeoutId !== null
  };
};

export const smoothScroll = (element, options = {}) => {
  const { behavior = "smooth", block = "nearest" } = options;
  if (element && typeof element.scrollIntoView === "function") {
    element.scrollIntoView({ behavior, block });
  }
};

export const scheduleAnimation = (element, className, duration, cleanup = false) => {
  return new Promise((resolve) => {
    element.classList.add(className);
    const timeout = setTimeout(() => {
      if (cleanup) element.classList.remove(className);
      resolve();
    }, duration);
  });
};
