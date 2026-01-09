import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from '../useChat';

// Mock supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'new-conv-id' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            is: vi.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      }))
    })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn()
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

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).__DEV_BYPASS_ENABLED = false;
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.conversations).toEqual([]);
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.activeConversationId).toBeNull();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should have sendMessage function', async () => {
    const { result } = renderHook(() => useChat());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('should have createConversation function', async () => {
    const { result } = renderHook(() => useChat());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.createConversation).toBe('function');
  });

  it('should have markAsRead function', async () => {
    const { result } = renderHook(() => useChat());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('should have setActiveConversationId function', async () => {
    const { result } = renderHook(() => useChat());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.setActiveConversationId).toBe('function');
    
    act(() => {
      result.current.setActiveConversationId('test-conversation-id');
    });
    
    expect(result.current.activeConversationId).toBe('test-conversation-id');
  });

  it('should return empty conversations when dev bypass is enabled', async () => {
    (window as any).__DEV_BYPASS_ENABLED = true;
    
    const { result } = renderHook(() => useChat());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
  });
});
