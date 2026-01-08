import { test, expect } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('Payment Flows', () => {
  test('Guest navigates to pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should see subscription plans
    await expect(page.getByText('Host Subscription Plans')).toBeVisible();
    await expect(page.getByText('Host Basic')).toBeVisible();
    await expect(page.getByText('Host Pro')).toBeVisible();
  });

  test('Subscription buttons are disabled without Stripe configured', async ({ page }) => {
    await page.goto('/pricing');
    
    // Buttons should be disabled since price_id is empty
    const subscribeButtons = page.getByRole('button', { name: /subscribe to/i });
    const buttonCount = await subscribeButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      await expect(subscribeButtons.nth(i)).toBeDisabled();
    }
  });

  test('Payment success page displays correctly', async ({ page }) => {
    await page.goto('/payment-success');
    
    await expect(page.getByText('Payment Successful')).toBeVisible();
    await expect(page.getByRole('button', { name: /go to dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back to home/i })).toBeVisible();
  });

  test('Payment canceled page displays correctly', async ({ page }) => {
    await page.goto('/payment-canceled');
    
    await expect(page.getByText('Payment Canceled')).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back to home/i })).toBeVisible();
  });

  test('User can navigate from payment success to dashboard', async ({ page }) => {
    await page.goto('/payment-success');
    
    await page.getByRole('button', { name: /go to dashboard/i }).click();
    
    // Should navigate to dashboard (or auth if not logged in)
    await expect(page).toHaveURL(/\/(user-dashboard|auth)/);
  });

  test('User can navigate from payment canceled to home', async ({ page }) => {
    await page.goto('/payment-canceled');
    
    await page.getByRole('button', { name: /back to home/i }).click();
    
    await expect(page).toHaveURL('/');
  });
});
