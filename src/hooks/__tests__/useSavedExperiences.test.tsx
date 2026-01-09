import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSavedExperiences } from '../useSavedExperiences';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }
}));

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  }))
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

describe('useSavedExperiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset dev bypass
    (window as any).__DEV_BYPASS_ENABLED = false;
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useSavedExperiences());

    expect(result.current.savedExperiences).toEqual([]);
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should have isExperienceSaved function', async () => {
    const { result } = renderHook(() => useSavedExperiences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.isExperienceSaved).toBe('function');
    expect(result.current.isExperienceSaved('non-existent-id')).toBe(false);
  });

  it('should have toggleSaveExperience function', async () => {
    const { result } = renderHook(() => useSavedExperiences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.toggleSaveExperience).toBe('function');
  });

  it('should have removeSavedExperience function', async () => {
    const { result } = renderHook(() => useSavedExperiences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.removeSavedExperience).toBe('function');
  });

  it('should have refetch function', async () => {
    const { result } = renderHook(() => useSavedExperiences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should return empty array when dev bypass is enabled', async () => {
    (window as any).__DEV_BYPASS_ENABLED = true;
    
    const { result } = renderHook(() => useSavedExperiences());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.savedExperiences).toEqual([]);
  });
});
