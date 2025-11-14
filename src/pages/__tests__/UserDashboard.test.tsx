import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import UserDashboard from '@/pages/UserDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';

vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useDashboardData');

const mockUseAuth = vi.mocked(useAuth);
const mockUseDashboardData = vi.mocked(useDashboardData);

describe('UserDashboard - Guest Features', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@test.com' } as any,
      profile: { id: 'user-1', first_name: 'Test' } as any,
      loading: false,
      currentRole: 'user',
      session: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signOut: vi.fn(),
      devBypass: vi.fn(),
      switchRole: vi.fn(),
    });

    mockUseDashboardData.mockReturnValue({
      loading: false,
      stats: {
        upcomingBookings: 2,
        savedExperiences: 5,
        unreadMessages: 3,
        completedBookings: 10,
      },
      bookings: [],
      savedExperiences: [],
      recentActivity: [],
      refreshData: vi.fn(),
    });
  });

  it('displays dashboard header with user name', () => {
    render(<UserDashboard />);
    expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
  });

  it('shows quick stats cards', () => {
    render(<UserDashboard />);
    expect(screen.getByText(/Upcoming Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Experiences/i)).toBeInTheDocument();
    expect(screen.getByText(/Unread Messages/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Bookings/i)).toBeInTheDocument();
  });

  it('displays stats values correctly', () => {
    render(<UserDashboard />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Upcoming bookings
    expect(screen.getByText('5')).toBeInTheDocument(); // Saved experiences
    expect(screen.getByText('3')).toBeInTheDocument(); // Unread messages
    expect(screen.getByText('10')).toBeInTheDocument(); // Completed bookings
  });

  it('shows tabs for different sections', () => {
    render(<UserDashboard />);
    expect(screen.getByRole('tab', { name: /My Bookings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Saved/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Messages/i })).toBeInTheDocument();
  });

  it('displays empty state when no bookings', () => {
    render(<UserDashboard />);
    expect(screen.getByText(/No bookings yet/i)).toBeInTheDocument();
  });
});

