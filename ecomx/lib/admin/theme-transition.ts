export const adminThemeTransitionMs = 380;

function getShell() {
  return document.querySelector(".admin-shell");
}

export function enableAdminThemeTransition() {
  document.documentElement.classList.add("admin-theme-transition");
  getShell()?.classList.add("admin-theme-transition");
}

export function disableAdminThemeTransition() {
  document.documentElement.classList.remove("admin-theme-transition");
  getShell()?.classList.remove("admin-theme-transition");
}

export function applyAdminThemeOnDocument(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Wraps a theme state update so colors cross-fade instead of snapping.
 * Call from the theme toggle before updating zustand.
 */
export function runAdminThemeTransition(update: () => void) {
  enableAdminThemeTransition();

  const finish = () => {
    window.setTimeout(disableAdminThemeTransition, adminThemeTransitionMs);
  };

  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };

  if (typeof doc.startViewTransition === "function") {
    const transition = doc.startViewTransition(update);
    if (transition?.finished) {
      transition.finished.finally(finish);
    } else {
      finish();
    }
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      update();
      finish();
    });
  });
}
