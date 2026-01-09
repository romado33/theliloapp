import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

// Mock supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn()
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' }
  }))
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.unreadCount).toBe(0);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should have markAsRead function', async () => {
    const { result } = renderHook(() => useNotifications());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('should have markAllAsRead function', async () => {
    const { result } = renderHook(() => useNotifications());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should have deleteNotification function', async () => {
    const { result } = renderHook(() => useNotifications());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.deleteNotification).toBe('function');
  });

  it('should have fetchNotifications function', async () => {
    const { result } = renderHook(() => useNotifications());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.fetchNotifications).toBe('function');
  });
});
