import { test, expect } from './fixtures';

test.describe('Host User Flows', () => {
  test('Host signs up', async ({ page, hostUser }) => {
    await page.goto('/auth');
    
    // Click sign up
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Fill sign up form
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    
    // Mark as host if checkbox exists
    const hostCheckbox = page.locator('input[type="checkbox"][name*="host"], input[type="checkbox"]:has-text("host")');
    if (await hostCheckbox.isVisible({ timeout: 2000 })) {
      await hostCheckbox.check();
    }
    
    // Submit
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Should show success message
    await expect(page.locator('text=/check your email|confirmation|success/i')).toBeVisible({ timeout: 10000 });
  });

  test('Host adds experience info', async ({ page, hostUser }) => {
    // Sign in as host
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Navigate to host dashboard
    await page.goto('/host-dashboard');
    
    // Click create experience
    const createButton = page.getByRole('button', { name: /create experience/i });
    await createButton.click();
    
    // Fill experience form
    await page.fill('input[name="title"], input[placeholder*="title" i]', 'Test Pottery Workshop');
    await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Learn the art of pottery making in this hands-on workshop.');
    await page.fill('input[name="price"], input[type="number"]:near(text="price")', '65');
    await page.fill('input[name="duration_hours"], input[placeholder*="duration" i]', '2');
    await page.fill('input[name="max_guests"], input[placeholder*="guests" i]', '8');
    await page.fill('input[name="location"], input[placeholder*="location" i]', 'Ottawa, ON');
    
    // Submit
    await page.getByRole('button', { name: /submit|create|save/i }).click();
    
    // Should show success or redirect
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('text=/success|created|saved/i').first().isVisible({ timeout: 5000 });
    expect(successMessage).toBeTruthy();
  });

  test('Host adds experience photos', async ({ page, hostUser }) => {
    // Sign in
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Go to host dashboard and create/edit experience
    await page.goto('/host-dashboard');
    
    const createButton = page.getByRole('button', { name: /create experience/i });
    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click();
      
      // Look for photo upload
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible({ timeout: 3000 })) {
        // Create a dummy file for testing
        await fileInput.setInputFiles({
          name: 'test-image.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake image data'),
        });
        
        // Should show upload progress or success
        await page.waitForTimeout(2000);
        const uploadSuccess = await page.locator('text=/upload|image|photo|success/i').first().isVisible({ timeout: 5000 });
        expect(uploadSuccess).toBeTruthy();
      }
    }
  });

  test('Host messages guest with booking', async ({ page, hostUser }) => {
    // Sign in as host
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    // Go to host dashboard bookings
    await page.goto('/host-dashboard');
    
    // Click on bookings tab
    const bookingsTab = page.getByRole('tab', { name: /bookings/i });
    if (await bookingsTab.isVisible({ timeout: 3000 })) {
      await bookingsTab.click();
      
      // Look for message guest button
      const messageButton = page.getByRole('button', { name: /message guest|contact guest/i }).first();
      if (await messageButton.isVisible({ timeout: 5000 })) {
        await messageButton.click();
        
        // Should navigate to messages or open message dialog
        await page.waitForTimeout(2000);
        const isMessagesPage = page.url().includes('messages') || 
                              await page.locator('text=/message|chat|conversation/i').first().isVisible({ timeout: 3000 });
        expect(isMessagesPage).toBeTruthy();
      }
    }
  });
});

test.describe('Host Dashboard Features', () => {
  test('Host views subscription tab', async ({ page, hostUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/host-dashboard');
    
    // Click subscription tab
    const subscriptionTab = page.getByRole('tab', { name: /subscription/i });
    await expect(subscriptionTab).toBeVisible({ timeout: 5000 });
    await subscriptionTab.click();
    
    // Should show subscription content
    await expect(page.locator('text=/subscription|plan|pricing/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('Host views booking management', async ({ page, hostUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/host-dashboard');
    
    // Click bookings tab
    const bookingsTab = page.getByRole('tab', { name: /bookings/i });
    await expect(bookingsTab).toBeVisible({ timeout: 5000 });
    await bookingsTab.click();
    
    // Should show booking filters or empty state
    const hasBookingContent = await page.locator('text=/pending|confirmed|completed|cancelled|no bookings/i').first().isVisible({ timeout: 5000 });
    expect(hasBookingContent).toBeTruthy();
  });

  test('Host views availability calendar', async ({ page, hostUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/host-dashboard');
    
    // Click availability tab
    const availabilityTab = page.getByRole('tab', { name: /availability/i });
    await expect(availabilityTab).toBeVisible({ timeout: 5000 });
    await availabilityTab.click();
    
    // Should show calendar UI
    const hasCalendarContent = await page.locator('[role="grid"], .rdp, text=/calendar|availability|select date/i').first().isVisible({ timeout: 5000 });
    expect(hasCalendarContent).toBeTruthy();
  });

  test('Host views revenue analytics', async ({ page, hostUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/host-dashboard');
    
    // Click analytics tab
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    await expect(analyticsTab).toBeVisible({ timeout: 5000 });
    await analyticsTab.click();
    
    // Should show analytics content
    const hasAnalyticsContent = await page.locator('text=/revenue|earnings|bookings|performance/i').first().isVisible({ timeout: 5000 });
    expect(hasAnalyticsContent).toBeTruthy();
  });

  test('Host dashboard shows stats overview', async ({ page, hostUser }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', hostUser.email);
    await page.fill('input[type="password"]', hostUser.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
    
    await page.goto('/host-dashboard');
    
    // Should show overview stats on default tab
    await expect(page.locator('text=/total experiences|active experiences|total bookings/i').first()).toBeVisible({ timeout: 5000 });
  });
});


