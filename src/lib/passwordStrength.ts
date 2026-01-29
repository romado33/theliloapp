/**
 * Password Strength Utility
 * 
 * Provides password strength validation and visual feedback
 */

interface PasswordStrength {
  score: number;        // 0-4
  label: string;        // "Weak", "Fair", etc.
  color: string;        // Tailwind color class
  suggestions: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: '',
      color: 'bg-muted',
      suggestions: ['Enter a password'],
    };
  }

  // Length checks
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('Add at least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('Add a special character (!@#$%...)');
  }

  // Common patterns to avoid
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/, // 3+ repeated characters
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid common patterns');
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score));

  const strengthLevels: Array<{ label: string; color: string }> = [
    { label: 'Very Weak', color: 'bg-destructive' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-lime-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ];

  return {
    score: normalizedScore,
    label: strengthLevels[normalizedScore].label,
    color: strengthLevels[normalizedScore].color,
    suggestions: suggestions.slice(0, 2), // Show max 2 suggestions
  };
};
