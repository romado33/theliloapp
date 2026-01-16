/**
 * Development utilities for bypassing auth and data fetching in development mode
 */

/**
 * Check if development bypass mode is enabled
 * This is used for testing UI without requiring authentication
 */
export const isDevBypassEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (window as Window & { __DEV_BYPASS_ENABLED?: boolean }).__DEV_BYPASS_ENABLED === true;
};

/**
 * Set development bypass mode
 */
export const setDevBypass = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  (window as Window & { __DEV_BYPASS_ENABLED?: boolean }).__DEV_BYPASS_ENABLED = enabled;
};

// Type declaration for the global dev bypass flag
declare global {
  interface Window {
    __DEV_BYPASS_ENABLED?: boolean;
  }
}
