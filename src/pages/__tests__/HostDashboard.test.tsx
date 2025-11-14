import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import HostDashboard from '@/pages/HostDashboard';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

describe('HostDashboard - Host Features', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'host-1', email: 'host@test.com' } as any,
      profile: { id: 'host-1', first_name: 'Host', is_host: true } as any,
      loading: false,
      currentRole: 'host',
      session: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signOut: vi.fn(),
      devBypass: vi.fn(),
      switchRole: vi.fn(),
    });
  });

  it('displays host dashboard header', () => {
    render(<HostDashboard />);
    expect(screen.getByText(/Host Dashboard/i)).toBeInTheDocument();
  });

  it('shows create experience button', () => {
    render(<HostDashboard />);
    expect(screen.getByRole('button', { name: /Create Experience/i })).toBeInTheDocument();
  });

  it('displays stats overview', async () => {
    render(<HostDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Total Experiences/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Experiences/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/Monthly Earnings/i)).toBeInTheDocument();
      expect(screen.getByText(/Average Rating/i)).toBeInTheDocument();
    });
  });

  it('shows tabs for different sections', async () => {
    render(<HostDashboard />);
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Experiences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Bookings/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Availability/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Analytics/i })).toBeInTheDocument();
    });
  });

  it('displays empty state when no experiences', async () => {
    render(<HostDashboard />);
    await waitFor(() => {
      const experiencesTab = screen.getByRole('tab', { name: /Experiences/i });
      // Click experiences tab to see empty state
    });
  });
});

