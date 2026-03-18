import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that handles chunk load failures.
 * This is common in SPAs when a new version is deployed and the browser
 * tries to load an old chunk that no longer exists.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    let pageHasAlreadyBeenForceRefreshed = false;
    try {
      const stored = window.sessionStorage.getItem('page-has-been-force-refreshed');
      pageHasAlreadyBeenForceRefreshed = (stored && stored.trim()) ? JSON.parse(stored) : false;
    } catch (e) {
      console.warn('Failed to access sessionStorage in lazyWithRetry:', e);
    }

    try {
      const component = await componentImport();
      try {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      } catch (e) { /* Ignore */ }
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        try {
          window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        } catch (e) { /* Ignore */ }
        window.location.reload();
        return new Promise(() => {}) as any;
      }
      throw error;
    }
  });
}
