import { Page } from '@playwright/test';

export async function signUp(page: Page, email: string, password: string, firstName?: string, lastName?: string) {
  await page.goto('/auth');
  await page.getByRole('button', { name: /sign up/i }).click();
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  if (firstName) {
    await page.fill('input[name="first_name"], input[placeholder*="First"]', firstName);
  }
  if (lastName) {
    await page.fill('input[name="last_name"], input[placeholder*="Last"]', lastName);
  }
  
  await page.getByRole('button', { name: /sign up|create account/i }).click();
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/(?!auth)/, { timeout: 10000 });
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: /sign out|log out/i }).click();
  await page.waitForURL('/auth', { timeout: 5000 });
}


