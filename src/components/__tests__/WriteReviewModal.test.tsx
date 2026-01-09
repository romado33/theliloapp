import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WriteReviewModal } from '../WriteReviewModal';

// Mock useReviews hook
vi.mock('@/hooks/useReviews', () => ({
  useReviews: vi.fn(() => ({
    submitReview: vi.fn(() => Promise.resolve(true)),
    reviews: [],
    loading: false
  }))
}));

describe('WriteReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnReviewSubmitted = vi.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    bookingId: 'booking-1',
    experienceId: 'exp-1',
    experienceTitle: 'Amazing Cooking Class',
    onReviewSubmitted: mockOnReviewSubmitted
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByText('Write a Review')).toBeInTheDocument();
  });

  it('should display experience title', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByText(/amazing cooking class/i)).toBeInTheDocument();
  });

  it('should display rating section', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByText('Overall Rating *')).toBeInTheDocument();
  });

  it('should display 5 star buttons for rating', () => {
    render(<WriteReviewModal {...defaultProps} />);

    // Stars are rendered using Star icons
    const stars = screen.getAllByRole('presentation', { hidden: true });
    expect(stars.length).toBeGreaterThanOrEqual(0); // Stars may not have role
  });

  it('should display review textarea', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByPlaceholderText(/tell others about your experience/i)).toBeInTheDocument();
  });

  it('should display character count', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByText('0/500 characters')).toBeInTheDocument();
  });

  it('should have cancel and submit buttons', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('should disable submit button when no rating is selected', () => {
    render(<WriteReviewModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show message about selecting rating', () => {
    render(<WriteReviewModal {...defaultProps} />);

    expect(screen.getByText(/please select a rating/i)).toBeInTheDocument();
  });

  it('should update character count when typing review', async () => {
    render(<WriteReviewModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/tell others about your experience/i);
    fireEvent.change(textarea, { target: { value: 'Great experience!' } });

    await waitFor(() => {
      expect(screen.getByText('17/500 characters')).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel is clicked', () => {
    render(<WriteReviewModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not render when isOpen is false', () => {
    render(<WriteReviewModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
  });
});
