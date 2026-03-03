/**
 * Development Mock Data Utilities
 * 
 * This file provides mock data for development and testing purposes.
 * Mock data is ONLY used when:
 * 1. Running in development mode (import.meta.env.DEV)
 * 2. Database is unavailable or experience not found
 * 3. Explicitly requested for testing
 * 
 * In production, this will never be used.
 */

import { MOCK_EXPERIENCES } from './experienceMockData';

export const DEV_MOCK_CONFIG = {
  // Enable/disable mock data fallback in development
  enableMockFallback: true,
  
  // Show visual indicator when using mock data
  showMockIndicator: true,
  
  // Log when mock data is used
  logMockUsage: true,
};

/**
 * Check if we should use mock data
 */
export const shouldUseMockData = (): boolean => {
  return import.meta.env.DEV && DEV_MOCK_CONFIG.enableMockFallback;
};

/**
 * Get mock experience by ID
 */
export const getMockExperience = (id: string) => {
  if (!shouldUseMockData()) {
    return null;
  }
  
  return MOCK_EXPERIENCES[id] || null;
};

/**
 * Get all mock experiences
 */
export const getAllMockExperiences = () => {
  if (!shouldUseMockData()) {
    return [];
  }
  
  return Object.values(MOCK_EXPERIENCES);
};

/**
 * Check if an experience ID is a mock ID
 */
export const isMockExperienceId = (id: string): boolean => {
  return id in MOCK_EXPERIENCES;
};

/**
 * Development helper: Seed database with mock data
 * Call this from browser console: window.seedMockData()
 */
export const seedMockData = async () => {
  if (!import.meta.env.DEV) {
    console.error('Mock data seeding is only available in development');
    return;
  }
  
  console.log('🌱 Seeding mock data...');
  console.log('Available mock experiences:', Object.keys(MOCK_EXPERIENCES).length);
  console.log('Mock experiences:', MOCK_EXPERIENCES);
  
  // You can add database seeding logic here if needed
  console.log('✅ Mock data ready for use');
};

// Expose to window in development for easy access
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).seedMockData = seedMockData;
  (window as any).MOCK_EXPERIENCES = MOCK_EXPERIENCES;
  (window as any).DEV_MOCK_CONFIG = DEV_MOCK_CONFIG;
  
  console.log('🛠️  Dev Tools Available:');
  console.log('  - window.seedMockData() - View/seed mock data');
  console.log('  - window.MOCK_EXPERIENCES - Access mock experiences');
  console.log('  - window.DEV_MOCK_CONFIG - Configure mock data behavior');
}

export default {
  shouldUseMockData,
  getMockExperience,
  getAllMockExperiences,
  isMockExperienceId,
  seedMockData,
  DEV_MOCK_CONFIG,
};
