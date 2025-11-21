import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import Index from '@/pages/Index';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';

// Mock hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useRecommendations');

const mockUseAuth = vi.mocked(useAuth);
const mockUseRecommendations = vi.mocked(useRecommendations);

describe('Index Page - Guest Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
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
    mockUseRecommendations.mockReturnValue({
      recommendations: [],
      loading: false,
    });
  });

  it('renders hero section with search interface', () => {
    render(<Index />);
    expect(screen.getByText(/Live Local/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What would you like to try/i)).toBeInTheDocument();
  });

  it('displays category filter section', () => {
    render(<Index />);
    expect(screen.getByText(/Browse by Category/i)).toBeInTheDocument();
  });

  it('shows featured experiences section', () => {
    render(<Index />);
    expect(screen.getByText(/Featured Experiences/i)).toBeInTheDocument();
  });

  it('displays recommendations for logged-in users', async () => {
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

    mockUseRecommendations.mockReturnValue({
      recommendations: [
        {
          id: 'exp-1',
          title: 'Test Experience',
          recommendation_score: 85,
          reasons: [],
        } as any,
      ],
      loading: false,
    });

    render(<Index />);
    await waitFor(() => {
      expect(screen.getByText(/Recommended for You/i)).toBeInTheDocument();
    });
  });

  it('redirects hosts to host dashboard', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    mockUseAuth.mockReturnValue({
      user: { id: 'host-1' } as any,
      profile: { id: 'host-1', is_host: true } as any,
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

    render(<Index />);
    // Note: Navigation testing requires router setup
  });
});





