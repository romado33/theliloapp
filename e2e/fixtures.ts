import { test as base } from '@playwright/test';

export type TestFixtures = {
  guestUser: { email: string; password: string };
  hostUser: { email: string; password: string };
};

export const test = base.extend<TestFixtures>({
  guestUser: async ({ page }, use) => {
    const guestUser = {
      email: `guest-${Date.now()}@test.com`,
      password: 'TestPassword123!',
    };
    await use(guestUser);
  },
  hostUser: async ({ page }, use) => {
    const hostUser = {
      email: `host-${Date.now()}@test.com`,
      password: 'TestPassword123!',
    };
    await use(hostUser);
  },
});

export { expect } from '@playwright/test';


