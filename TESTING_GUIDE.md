# Testing Guide

This document provides instructions for running tests locally on this project.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

```bash
# Install project dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

---

## Unit Tests (Vitest)

Unit tests use [Vitest](https://vitest.dev/) with React Testing Library.

### Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once and exit |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run test:coverage` | Run tests with coverage report |

### Test Location

Unit tests are located in `src/**/__tests__/` directories:
- `src/components/__tests__/` - Component tests
- `src/hooks/__tests__/` - Hook tests
- `src/lib/__tests__/` - Utility function tests
- `src/pages/__tests__/` - Page component tests

### Running Specific Tests

```bash
# Run a specific test file
npm test -- src/hooks/__tests__/useAuth.test.tsx

# Run tests matching a pattern
npm test -- --grep "useAuth"
```

---

## End-to-End Tests (Playwright)

E2E tests use [Playwright](https://playwright.dev/) for browser automation.

### Commands

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all E2E tests |
| `npx playwright test --ui` | Open Playwright UI |
| `npx playwright test --headed` | Run tests with visible browser |
| `npx playwright show-report` | View HTML test report |

### Test Location

E2E tests are located in the `e2e/` directory:
- `e2e/guest-flows.spec.ts` - Guest user workflows
- `e2e/host-flows.spec.ts` - Host user workflows
- `e2e/payment-flows.spec.ts` - Payment workflows
- `e2e/user-dashboard-flows.spec.ts` - User dashboard tests

### Running E2E Tests

**Option 1: Start dev server manually**
```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run E2E tests
npx playwright test
```

**Option 2: Let Playwright start the server**
The `playwright.config.ts` is configured with `webServer` to automatically start the dev server.

### Running Specific E2E Tests

```bash
# Run a specific test file
npx playwright test e2e/guest-flows.spec.ts

# Run tests matching a pattern
npx playwright test --grep "Guest books"

# Run in a specific browser
npx playwright test --project=chromium
```

### Debugging E2E Tests

```bash
# Debug mode (step through tests)
npx playwright test --debug

# Generate test code by recording actions
npx playwright codegen http://localhost:5173
```

---

## Test Reports

### Unit Test Coverage

```bash
npm run test:coverage
```

Coverage report is generated in the `coverage/` directory.

### E2E Test Report

```bash
npx playwright show-report
```

HTML report is generated in the `playwright-report/` directory.

---

## Troubleshooting

### Common Issues

1. **Playwright browsers not installed**
   ```bash
   npx playwright install
   ```

2. **Port already in use**
   - Stop any running dev servers on port 5173
   - Or modify the port in `vite.config.ts`

3. **Tests timing out**
   - Increase timeout in test config
   - Ensure dev server is running for E2E tests

4. **Supabase mock issues**
   - Tests use mocked Supabase client in `src/test/mocks/`
   - Ensure mocks are properly set up in `src/test/setup.ts`

---

## Environment Setup

For E2E tests that require environment variables:

1. Copy `.env.example` to `.env.local`
2. Fill in required values
3. For development bypass, set `VITE_DEV_BYPASS_PASSWORD`

---

## CI/CD

Tests run automatically via GitHub Actions (`.github/workflows/test.yml`).

To run the same tests locally that CI runs:
```bash
npm run test:run && npx playwright test
```
