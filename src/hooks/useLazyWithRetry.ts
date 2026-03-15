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
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Set the flag in session storage so we don't enter an infinite loop
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        // Refresh the page to get the latest manifest and chunks
        window.location.reload();
        // Return a promise that never resolves to stop execution
        return new Promise(() => {});
      }

      // If we've already refreshed and it still fails, throw the error
      throw error;
    }
  });
}
