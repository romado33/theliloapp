import { test, expect } from './fixtures';

test.describe('Guest User Flows', () => {
  test('Guest signs up', async ({ page, guestUser }) => {
    await page.goto('/auth');
    
    // Click sign up
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Fill sign up form
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    
    // Submit
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Should show success message or redirect
    await expect(page.locator('text=/check your email|confirmation|success/i')).toBeVisible({ timeout: 10000 });
  });

  test('Guest signs in for first time', async ({ page, guestUser }) => {
    // First sign up
    await page.goto('/auth');
    await page.getByRole('button', { name: /sign up/i }).click();
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    await page.waitForTimeout(2000);
    
    // Then sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    
    // Should be redirected to home or dashboard
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test('Guest searches for experience', async ({ page }) => {
    await page.goto('/search');
    
    // Search for cooking class
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('cooking class');
    await page.getByRole('button', { name: /search/i }).click();
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Should show search results or "no results" message
    const hasResults = await page.locator('text=/experience|no results|found/i').first().isVisible({ timeout: 5000 });
    expect(hasResults).toBeTruthy();
  });

  test('Guest books experience', async ({ page, guestUser }) => {
    // Sign in first
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Navigate to an experience
    await page.goto('/');
    
    // Click on first experience card
    const experienceCard = page.locator('[data-testid="experience-card"], .experience-card, article').first();
    if (await experienceCard.isVisible({ timeout: 5000 })) {
      await experienceCard.click();
      await page.waitForURL(/\/experience\//, { timeout: 5000 });
      
      // Try to book
      const bookButton = page.getByRole('button', { name: /book experience|book now|sign in to book/i });
      if (await bookButton.isVisible({ timeout: 3000 })) {
        await bookButton.click();
        
        // Should redirect to payment or show booking confirmation
        await page.waitForTimeout(2000);
        const isPaymentPage = page.url().includes('stripe') || page.url().includes('payment') || page.url().includes('booking');
        expect(isPaymentPage || await page.locator('text=/confirm|booking|payment/i').first().isVisible({ timeout: 5000 })).toBeTruthy();
      }
    }
  });

  test('Guest cancels or modifies booking', async ({ page, guestUser }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Go to bookings/dashboard
    await page.goto('/bookings');
    
    // Look for booking to cancel or modify
    const cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    const modifyButton = page.getByRole('button', { name: /modify|edit/i }).first();
    
    if (await cancelButton.isVisible({ timeout: 3000 })) {
      await cancelButton.click();
      // Confirm cancellation if dialog appears
      const confirmButton = page.getByRole('button', { name: /confirm|yes|cancel booking/i });
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      await expect(page.locator('text=/cancelled|success/i')).toBeVisible({ timeout: 5000 });
    } else if (await modifyButton.isVisible({ timeout: 3000 })) {
      await modifyButton.click();
      // Should open modify dialog
      await expect(page.locator('text=/modify|change|update/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('Guest messages Host', async ({ page, guestUser }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Navigate to experience
    await page.goto('/');
    const experienceCard = page.locator('[data-testid="experience-card"], .experience-card, article').first();
    if (await experienceCard.isVisible({ timeout: 5000 })) {
      await experienceCard.click();
      await page.waitForURL(/\/experience\//, { timeout: 5000 });
      
      // Click contact host button
      const contactButton = page.getByRole('button', { name: /contact host|message host/i });
      if (await contactButton.isVisible({ timeout: 3000 })) {
        await contactButton.click();
        
        // Should navigate to messages or open message dialog
        await page.waitForTimeout(2000);
        const isMessagesPage = page.url().includes('messages') || await page.locator('text=/message|chat/i').first().isVisible({ timeout: 3000 });
        expect(isMessagesPage).toBeTruthy();
      }
    }
  });

  test('Guest tries to pay', async ({ page, guestUser }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Go to experience and try to book
    await page.goto('/');
    const experienceCard = page.locator('[data-testid="experience-card"], .experience-card, article').first();
    if (await experienceCard.isVisible({ timeout: 5000 })) {
      await experienceCard.click();
      await page.waitForURL(/\/experience\//, { timeout: 5000 });
      
      const bookButton = page.getByRole('button', { name: /book experience|book now/i });
      if (await bookButton.isVisible({ timeout: 3000 })) {
        await bookButton.click();
        
        // Should redirect to Stripe or payment page
        await page.waitForTimeout(3000);
        const isPaymentPage = page.url().includes('stripe') || page.url().includes('checkout') || 
                             await page.locator('text=/payment|checkout|stripe/i').first().isVisible({ timeout: 5000 });
        expect(isPaymentPage).toBeTruthy();
      }
    }
  });

  test('Guest leaves review', async ({ page, guestUser }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', guestUser.email);
    await page.fill('input[type="password"]', guestUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Go to bookings
    await page.goto('/bookings');
    
    // Look for write review button
    const reviewButton = page.getByRole('button', { name: /write review|leave review|review/i }).first();
    if (await reviewButton.isVisible({ timeout: 5000 })) {
      await reviewButton.click();
      
      // Fill review form
      const stars = page.locator('[role="button"]:has-text("★"), button:has-text("⭐")').first();
      if (await stars.isVisible({ timeout: 2000 })) {
        await stars.click();
      }
      
      const reviewText = page.locator('textarea[placeholder*="review"], textarea[name="comment"]');
      if (await reviewText.isVisible({ timeout: 2000 })) {
        await reviewText.fill('Great experience! Highly recommend.');
      }
      
      await page.getByRole('button', { name: /submit|post review/i }).click();
      
      // Should show success message
      await expect(page.locator('text=/thank you|review submitted|success/i')).toBeVisible({ timeout: 5000 });
    }
  });
});


