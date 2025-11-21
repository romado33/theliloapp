import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import ExperienceSearch from '@/pages/ExperienceSearch';
import userEvent from '@testing-library/user-event';

describe('ExperienceSearch - Guest Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search interface', () => {
    render(<ExperienceSearch />);
    expect(screen.getByText(/Search Experiences/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search for cooking classes/i)).toBeInTheDocument();
  });

  it('displays basic and advanced search toggle', () => {
    render(<ExperienceSearch />);
    expect(screen.getByText(/Basic/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced/i)).toBeInTheDocument();
  });

  it('shows search tips section', () => {
    render(<ExperienceSearch />);
    expect(screen.getByText(/Search Tips/i)).toBeInTheDocument();
    expect(screen.getByText(/Semantic Search/i)).toBeInTheDocument();
  });

  it('allows switching between basic and advanced search', async () => {
    const user = userEvent.setup();
    render(<ExperienceSearch />);

    const advancedToggle = screen.getByRole('switch', { name: /advanced/i });
    await user.click(advancedToggle);

    await waitFor(() => {
      expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    });
  });
});





