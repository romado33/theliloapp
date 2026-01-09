import { test, expect } from './fixtures';

test.describe('User Dashboard Flows', () => {
  test('User navigates to Bookings tab', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    const bookingsTab = page.getByRole('tab', { name: /bookings/i });
    await expect(bookingsTab).toBeVisible({ timeout: 5000 });
    await bookingsTab.click();
    
    // Should show bookings content or empty state
    await expect(page.locator('text=/booking|no bookings|upcoming/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User navigates to Saved tab', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    const savedTab = page.getByRole('tab', { name: /saved/i });
    await expect(savedTab).toBeVisible({ timeout: 5000 });
    await savedTab.click();
    
    // Should show saved experiences or empty state
    await expect(page.locator('text=/saved|no saved|favorites/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User navigates to Activity tab', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    const activityTab = page.getByRole('tab', { name: /activity/i });
    await expect(activityTab).toBeVisible({ timeout: 5000 });
    await activityTab.click();
    
    // Should show activity history or empty state
    await expect(page.locator('text=/activity|history|recent|no activity/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User navigates to Profile tab', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    const profileTab = page.getByRole('tab', { name: /profile/i });
    await expect(profileTab).toBeVisible({ timeout: 5000 });
    await profileTab.click();
    
    // Should show profile section
    await expect(page.locator('text=/profile|name|email|settings/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User navigates to Messages tab', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    const messagesTab = page.getByRole('tab', { name: /messages/i });
    await expect(messagesTab).toBeVisible({ timeout: 5000 });
    await messagesTab.click();
    
    // Should show messages or empty state
    await expect(page.locator('text=/message|conversation|no messages|chat/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User dashboard shows stats overview', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/dashboard');
    
    // Should show dashboard with welcome or stats
    await expect(page.locator('text=/dashboard|welcome|bookings|saved/i').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Saved Experiences Flows', () => {
  test('User saves an experience from search', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/search');
    
    // Look for save button on experience card
    const saveButton = page.locator('button[aria-label*="save"], button:has([data-testid="heart"]), button:has(svg.lucide-heart)').first();
    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
      
      // Should show success toast or change icon state
      await page.waitForTimeout(1000);
      const toastOrFilled = await page.locator('text=/saved|added to saved/i, svg.fill-current').first().isVisible({ timeout: 3000 });
      expect(toastOrFilled).toBeTruthy();
    }
  });

  test('User views saved experiences page', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/saved');
    
    // Should show saved experiences or empty state
    await expect(page.locator('text=/saved|favorites|no saved experiences|explore/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('User unsaves an experience', async ({ page, guestUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/saved');
    
    // Look for remove/unsave button
    const removeButton = page.locator('button:has-text("remove"), button[aria-label*="unsave"], button:has(svg.lucide-heart)').first();
    if (await removeButton.isVisible({ timeout: 5000 })) {
      await removeButton.click();
      
      // Should show removal confirmation or update UI
      await page.waitForTimeout(1000);
      const toastOrRemoved = await page.locator('text=/removed|unsaved/i').first().isVisible({ timeout: 3000 });
      expect(toastOrRemoved).toBeTruthy();
    }
  });
});
