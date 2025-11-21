import { Page } from '@playwright/test';

export async function searchForExperience(page: Page, query: string) {
  await page.goto('/search');
  await page.fill('input[placeholder*="Search"], input[type="search"]', query);
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForTimeout(1000); // Wait for results
}

export async function selectExperience(page: Page, experienceTitle: string) {
  await page.getByText(experienceTitle).first().click();
  await page.waitForURL(/\/experience\//, { timeout: 5000 });
}

export async function bookExperience(page: Page, guestCount: number = 2) {
  // Select time slot if available
  const timeSlot = page.locator('button:has-text("spots left"), button:has-text("available")').first();
  if (await timeSlot.isVisible({ timeout: 2000 })) {
    await timeSlot.click();
  }
  
  // Set guest count
  const guestCountInput = page.locator('input[type="number"]').first();
  if (await guestCountInput.isVisible({ timeout: 2000 })) {
    await guestCountInput.fill(guestCount.toString());
  }
  
  // Click book button
  await page.getByRole('button', { name: /book experience|book now/i }).click();
}

export async function createExperience(page: Page, experienceData: {
  title: string;
  description: string;
  price: number;
  duration: number;
  maxGuests: number;
  location: string;
}) {
  await page.goto('/host-dashboard');
  await page.getByRole('button', { name: /create experience/i }).click();
  
  await page.fill('input[name="title"], input[placeholder*="title" i]', experienceData.title);
  await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', experienceData.description);
  await page.fill('input[name="price"], input[type="number"]', experienceData.price.toString());
  await page.fill('input[name="duration"], input[placeholder*="duration" i]', experienceData.duration.toString());
  await page.fill('input[name="max_guests"], input[placeholder*="guests" i]', experienceData.maxGuests.toString());
  await page.fill('input[name="location"], input[placeholder*="location" i]', experienceData.location);
  
  await page.getByRole('button', { name: /submit|create|save/i }).click();
}


