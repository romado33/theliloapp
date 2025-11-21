import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import SearchInterface from '@/components/SearchInterface';
import userEvent from '@testing-library/user-event';

// Supabase is mocked globally in setup.ts

describe('SearchInterface Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchInterface />);
    expect(screen.getByPlaceholderText(/Search experiences/i)).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<SearchInterface />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('allows typing in search input', async () => {
    const user = userEvent.setup();
    render(<SearchInterface />);

    const input = screen.getByPlaceholderText(/Search experiences/i);
    await user.type(input, 'cooking class');

    expect(input).toHaveValue('cooking class');
  });

  it('shows filters panel when filters button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchInterface showFilters={true} />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  });
});




