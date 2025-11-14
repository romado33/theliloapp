import { describe, it, expect } from 'vitest';
import { formatDateTime, formatDate, formatDateShort, isValidUUID } from '@/lib/dateUtils';

describe('dateUtils', () => {
  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const dateString = '2024-01-15T14:30:00Z';
      const result = formatDateTime(dateString);
      
      expect(result.date).toContain('January');
      expect(result.date).toContain('15');
      expect(result.date).toContain('2024');
      expect(result.time).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const dateString = '2024-01-15T14:30:00Z';
      const result = formatDate(dateString);
      
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('formats date in short format', () => {
      const dateString = '2024-01-15T14:30:00Z';
      const result = formatDateShort(dateString);
      
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('isValidUUID', () => {
    it('validates correct UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it('rejects invalid UUID', () => {
      const invalidUUID = 'not-a-uuid';
      expect(isValidUUID(invalidUUID)).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidUUID('')).toBe(false);
    });
  });
});

