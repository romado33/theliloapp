import { describe, it, expect } from 'vitest';
import {
  getStatusColor,
  getStatusText,
  getStatusBadgeVariant,
  type BookingStatus,
} from '@/lib/bookingUtils';

describe('bookingUtils', () => {
  describe('getStatusColor', () => {
    it('returns correct color for confirmed status', () => {
      expect(getStatusColor('confirmed')).toBe('bg-green-100 text-green-800');
    });

    it('returns correct color for pending status', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('returns correct color for cancelled status', () => {
      expect(getStatusColor('cancelled')).toBe('bg-red-100 text-red-800');
    });

    it('returns correct color for completed status', () => {
      expect(getStatusColor('completed')).toBe('bg-blue-100 text-blue-800');
    });
  });

  describe('getStatusText', () => {
    it('returns correct text for confirmed status', () => {
      expect(getStatusText('confirmed')).toBe('Confirmed');
    });

    it('returns correct text for pending status', () => {
      expect(getStatusText('pending')).toBe('Awaiting Host Approval');
    });

    it('returns correct text for cancelled status', () => {
      expect(getStatusText('cancelled')).toBe('Cancelled');
    });

    it('returns correct text for completed status', () => {
      expect(getStatusText('completed')).toBe('Completed');
    });
  });

  describe('getStatusBadgeVariant', () => {
    it('returns correct variant for confirmed status', () => {
      expect(getStatusBadgeVariant('confirmed')).toBe('default');
    });

    it('returns correct variant for pending status', () => {
      expect(getStatusBadgeVariant('pending')).toBe('secondary');
    });

    it('returns correct variant for cancelled status', () => {
      expect(getStatusBadgeVariant('cancelled')).toBe('destructive');
    });

    it('returns correct variant for completed status', () => {
      expect(getStatusBadgeVariant('completed')).toBe('default');
    });
  });
});





