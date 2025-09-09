import { z } from 'zod';
import { sanitizeString } from './sanitize';

// Validation schemas with sanitization
export const experienceSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .transform(sanitizeString),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .transform(sanitizeString),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters')
    .transform(sanitizeString),
  address: z.string()
    .max(300, 'Address must be less than 300 characters')
    .transform(sanitizeString)
    .optional(),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(10000, 'Price must be reasonable'),
  duration_hours: z.number()
    .min(0.5, 'Duration must be at least 30 minutes')
    .max(24, 'Duration must be less than 24 hours'),
  max_guests: z.number()
    .min(1, 'Must allow at least 1 guest')
    .max(50, 'Maximum 50 guests allowed'),
  what_included: z.array(z.string().transform(sanitizeString)).optional(),
  what_to_bring: z.array(z.string().transform(sanitizeString)).optional(),
  cancellation_policy: z.string()
    .max(500, 'Cancellation policy must be less than 500 characters')
    .transform(sanitizeString)
    .optional()
});

export const profileSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .transform(sanitizeString),
  last_name: z.string()
    .max(50, 'Last name must be less than 50 characters')
    .transform(sanitizeString)
    .optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .transform(sanitizeString)
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .transform(sanitizeString)
    .optional(),
  phone: z.string()
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format')
    .transform(sanitizeString)
    .optional()
});

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .transform(sanitizeString)
});

export const reviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string()
    .max(500, 'Review comment must be less than 500 characters')
    .transform(sanitizeString)
    .optional()
});

// File validation for secure uploads
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Only JPG, PNG, and WebP files are allowed' };
  }

  return { valid: true };
};