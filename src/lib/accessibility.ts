// Accessibility utilities and constants

export const ARIA_LABELS = {
  // Navigation
  mainNav: 'Main navigation',
  userMenu: 'User account menu',
  sidebarToggle: 'Toggle sidebar',
  
  // Search
  searchInput: 'Search for experiences',
  searchButton: 'Search experiences',
  clearSearch: 'Clear search query',
  filterToggle: 'Toggle search filters',
  
  // Bookings
  selectDate: 'Select booking date',
  selectTime: 'Select time slot',
  guestCount: 'Number of guests',
  bookNow: 'Book this experience',
  
  // Experience Actions
  saveExperience: 'Save experience to favorites',
  removeSaved: 'Remove from saved experiences',
  shareExperience: 'Share this experience',
  reportContent: 'Report inappropriate content',
  contactHost: 'Contact the host',
  
  // Reviews
  rating: 'Rating',
  writeReview: 'Write a review',
  submitReview: 'Submit review',
  
  // Auth
  signIn: 'Sign in to your account',
  signUp: 'Create new account',
  signOut: 'Sign out',
  googleSignIn: 'Sign in with Google',
  appleSignIn: 'Sign in with Apple',
  
  // Forms
  emailInput: 'Email address',
  passwordInput: 'Password',
  firstNameInput: 'First name',
  lastNameInput: 'Last name',
  
  // General
  goHome: 'Go to home page',
  goBack: 'Go back to previous page',
  loadMore: 'Load more results',
  close: 'Close',
  submit: 'Submit',
  cancel: 'Cancel',
} as const;

// Focus trap utility for modals
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();
  
  return () => element.removeEventListener('keydown', handleKeyDown);
};

// Announce to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Generate unique IDs for form elements
let idCounter = 0;
export const generateId = (prefix: string = 'id') => {
  return `${prefix}-${++idCounter}`;
};
