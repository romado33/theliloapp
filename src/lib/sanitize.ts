import DOMPurify from 'dompurify';

// Enhanced XSS protection with DOMPurify
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  // Basic sanitization for plain text inputs
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim();
};

// For HTML content that should preserve some formatting
export const sanitizeHTML = (input: string): string => {
  if (!input) return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// For user-generated content display
export const sanitizeDisplayText = (input: string): string => {
  if (!input) return '';
  
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
};
