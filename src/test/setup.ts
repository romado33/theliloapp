import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';

// CRITICAL: Mock Supabase BEFORE any other imports that might use it
// Use vi.hoisted to ensure the mock is properly hoisted
const mockOnAuthStateChange = vi.hoisted(() => {
  return vi.fn((callback: (event: string, session: any) => void) => {
    // Call callback synchronously - React will handle the state update
    try {
      callback('SIGNED_OUT', null);
    } catch (e) {
      // Ignore errors during callback
    }
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  });
});

const mockGetSession = vi.hoisted(() => {
  return vi.fn(() =>
    Promise.resolve({
      data: { session: null },
      error: null,
    })
  );
});

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      auth: {
        onAuthStateChange: mockOnAuthStateChange,
        getSession: mockGetSession,
        signUp: vi.fn(() => Promise.resolve({ error: null })),
        signInWithPassword: vi.fn(() => Promise.resolve({ error: null })),
        signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
      },
      functions: {
        invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
      },
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(),
        })),
      })),
      removeChannel: vi.fn(),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
});

// Suppress console errors in tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
