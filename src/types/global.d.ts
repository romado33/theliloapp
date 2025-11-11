/**
 * Global type declarations for development utilities
 */

declare global {
  interface Window {
    __DEV_BYPASS_ENABLED?: boolean;
  }
}

export {};

