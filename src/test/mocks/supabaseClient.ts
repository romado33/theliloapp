import { vi } from 'vitest';

/**
 * Centralized Supabase mock for tests
 * This ensures consistent mocking across all test files
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn((table: string) => ({
    select: vi.fn((columns?: string) => ({
      eq: vi.fn((column: string, value: unknown) => ({
        eq: vi.fn((column2: string, value2: unknown) => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      neq: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      or: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
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
    onAuthStateChange: vi.fn((callback) => {
      // Call callback immediately with signed out state
      setTimeout(() => callback('SIGNED_OUT', null), 0);
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    }),
    getSession: vi.fn(() =>
      Promise.resolve({
        data: { session: null },
        error: null,
      })
    ),
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
});


