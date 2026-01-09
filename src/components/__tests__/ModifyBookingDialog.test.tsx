import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModifyBookingDialog } from '../ModifyBookingDialog';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            }))
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

const mockBooking = {
  id: 'booking-1',
  experience_id: 'exp-1',
  availability_id: 'avail-1',
  booking_date: '2025-01-15T10:00:00Z',
  guest_count: 2,
  special_requests: 'No allergies',
  experience: {
    max_guests: 10
  }
};

describe('ModifyBookingDialog', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when booking is null', () => {
    const { container } = render(
      <ModifyBookingDialog
        booking={null}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render dialog when open with booking', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Modify Booking')).toBeInTheDocument();
    });
  });

  it('should display guest count input with initial value', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      const guestInput = screen.getByLabelText(/number of guests/i);
      expect(guestInput).toHaveValue(2);
    });
  });

  it('should display special requests textarea with initial value', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      const textarea = screen.getByLabelText(/special requests/i);
      expect(textarea).toHaveValue('No allergies');
    });
  });

  it('should have cancel and update buttons', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update booking/i })).toBeInTheDocument();
    });
  });

  it('should call onOpenChange when cancel is clicked', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display max guests info', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/maximum 10 guests/i)).toBeInTheDocument();
    });
  });

  it('should display time slot selector', async () => {
    render(
      <ModifyBookingDialog
        booking={mockBooking}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/select new time slot/i)).toBeInTheDocument();
    });
  });
});
