/**
 * Centralized logging utility
 * Replace console.log statements with this for better control
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
};

