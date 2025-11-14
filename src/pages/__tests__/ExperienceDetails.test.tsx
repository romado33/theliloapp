import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { useParams } from 'react-router-dom';
import ExperienceDetails from '@/pages/ExperienceDetails';
import userEvent from '@testing-library/user-event';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: {
                id: 'exp-1',
                title: 'Pottery Workshop',
                description: 'Learn pottery',
                price: 65,
                duration_hours: 2,
                max_guests: 8,
                location: 'Ottawa',
                image_urls: ['/placeholder.jpg'],
                categories: { name: 'Arts & Crafts' },
                profiles: { first_name: 'John' },
              },
              error: null,
            })
          ),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { url: 'https://stripe.com/checkout' }, error: null })),
    },
  },
}));

describe('ExperienceDetails - Guest Features', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({ id: 'exp-1' });
  });

  it('displays experience title and details', async () => {
    render(<ExperienceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Pottery Workshop/i)).toBeInTheDocument();
    });
  });

  it('shows booking sidebar with price', async () => {
    render(<ExperienceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/\$65/i)).toBeInTheDocument();
    });
  });

  it('displays guest count selector', async () => {
    render(<ExperienceDetails />);
    await waitFor(() => {
      expect(screen.getByText(/Number of Guests/i)).toBeInTheDocument();
    });
  });

  it('allows saving experience to favorites', async () => {
    render(<ExperienceDetails />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  it('shows contact host button', async () => {
    render(<ExperienceDetails />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /contact host/i })).toBeInTheDocument();
    });
  });
});

