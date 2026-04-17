---
name: test-automation
description: Comprehensive test automation skills using Playwright, Cucumber, and other testing frameworks. Covers E2E testing, integration testing, BDD patterns, test maintenance, and CI/CD integration. Use when writing automated tests, setting up test infrastructure, or implementing behavior-driven development.
license: MIT
version: 1.0.0
---

# Test Automation Skill

Production-ready test automation with modern frameworks, patterns, and best practices.

## When to Use

- Setting up E2E test automation from scratch
- Writing Playwright tests for web/mobile apps
- Implementing Cucumber/BDD scenarios
- Integrating tests with CI/CD pipelines
- Creating maintainable, flaky-resistant test suites
- Debugging test failures

## Supported Frameworks

### E2E Testing
- **Playwright** - Primary E2E framework (recommended)
- **Cypress** - Alternative E2E framework
- **Puppeteer** - Low-level browser automation

### BDD/Behavior Testing
- **Cucumber** - Gherkin-based BDD
- **SpecFlow** - Cucumber for .NET

### Mobile Testing
- **Appium** - Cross-platform mobile automation
- **Detox** - React Native E2E testing

### API Testing
- **Supertest** - HTTP assertions
- **Rest Assured** - Java API testing
- ** Newman** - Postman CLI

## Playwright Quick Start

### Installation
```bash
npm init playwright@latest
# OR
npm install -D @playwright/test playwright
npx playwright install --with-deps
```

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Feature', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Cucumber/BDD Quick Start

### Installation
```bash
npm install -D @cucumber/cucumber @playwright/test
```

### Feature File
```gherkin
Feature: Login functionality

  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When the user enters "user@example.com" in the email field
    And the user enters "password123" in the password field
    And the user clicks the login button
    Then the user should be redirected to the dashboard
    And the user should see their username

  Scenario: Failed login with invalid credentials
    Given the user is on the login page
    When the user enters "invalid@example.com" in the email field
    And the user enters "wrongpassword" in the password field
    And the user clicks the login button
    Then the user should see an error message
```

### Step Definitions
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';

let page: Page;

Given('the user is on the login page', async function() {
  await page.goto('/login');
});

When('the user enters {string} in the email field', async function(email: string) {
  await page.fill('[data-testid="email"]', email);
});

When('the user enters {string} in the password field', async function(password: string) {
  await page.fill('[data-testid="password"]', password);
});

When('the user clicks the login button', async function() {
  await page.click('[data-testid="login-button"]');
});

Then('the user should be redirected to the dashboard', async function() {
  await expect(page).toHaveURL('/dashboard');
});

Then('the user should see an error message', async function() {
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## Best Practices

### 1. Test Data Management
```typescript
// Use fixtures for test data
test.use({
  testData: {
    user: { email: 'test@example.com', password: 'password123' },
    admin: { email: 'admin@example.com', password: 'admin123' },
  },
});

// In tests
test('admin can access settings', async ({ page }) => {
  const admin = test.config.testData.admin;
  await page.login(admin.email, admin.password);
});
```

### 2. Page Object Model
```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// Usage in test
import { LoginPage } from '../pages/LoginPage';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
});
```

### 3. Handle Dynamic Content
```typescript
// Wait for elements properly
await page.waitForSelector('[data-testid="loaded-content"]');
await expect(page.locator('[data-testid="spinner"]')).toBeHidden();

// Handle navigation
await page.click('[data-testid="submit"]');
await page.waitForURL('/success');

// Handle dialogs
page.on('dialog', async dialog => {
  await dialog.accept();
});
```

### 4. Reduce Flakiness
```typescript
// Use locators that don't change
// ✅ Good: data-testid, role, text
await page.click('[data-testid="submit-button"]');
await page.getByRole('button', { name: 'Submit' });

// ❌ Avoid: indices, partial text
await page.locator('button').nth(0);
await page.locator('button:has-text("Sub")');

// Use proper waits instead of sleep
await page.waitForLoadState('networkidle');
await expect(locator).toBeVisible({ timeout: 10000 });
```

### 5. Parallel Execution
```typescript
// Playwright runs tests in parallel by default
// Configure in playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : 4, // Limit on CI
});
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Run Specific Tests
```bash
# Run by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression

# Run by file pattern
npx playwright test "tests/login/**"
npx playwright test "tests/login/login.spec.ts"

# Run specific suite
npx playwright test --project=chromium
```

## Test Maintenance

### Debug Failed Tests
```bash
# Interactive mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# With trace
npx playwright test --trace on
# View trace: npx playwright show-trace trace.zip
```

### Update Tests After UI Changes
```bash
# Update snapshots
npx playwright test --update-snapshots

# Codegen new selectors
npx playwright codegen
```

### Test Reports
```bash
# HTML report
npx playwright show-report

# JSON report for CI
npx playwright test --reporter=json
```

## Resources

- Playwright Docs: https://playwright.dev/docs/intro
- Cucumber Docs: https://cucumber.io/docs/
- Playwright Best Practices: https://playwright.dev/docs/best-practices
- MS Playwright Testing: https://learn.microsoft.com/en-us/playwright/

## Credential Management

See: [references/credential-management.md](references/credential-management.md) for detailed guide on storing and managing test credentials across local, CI/CD, and cloud environments.
.env.example            # Template - commit
tests/
├── .env               # Test-specific credentials
├── fixtures/
│   └── accounts.json # Encrypted or gitignored
```

### Environment Variables Setup

**1. Create `.env` file:**
```bash
# .env - Local development (DO NOT COMMIT)
TEST_USER=admin@example.com
TEST_PASS=SecurePassword123
API_KEY=sk_test_xxx
ADMIN_ID=12345

# Staging environment
STAGING_URL=https://staging.example.com
STAGING_USER=staging@example.com
STAGING_PASS=staging_pass
```

**2. Create `.env.example` (template - commit):**
```bash
# .env.example - Copy this and fill in your values
TEST_USER=
TEST_PASS=
API_KEY=
ADMIN_ID=
```

**3. Add to `.gitignore`:**
```
.env
.env.local
.env.*.local
tests/.env
tests/fixtures/credentials.json
playwright/.auth/
```

### Playwright Config with Credentials

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  use: {
    // Use environment variables in tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  // Pass credentials to tests via environment
});
```

### Using Credentials in Tests

```typescript
import { test, expect } from '@playwright/test';

test('login with stored credentials', async ({ page }) => {
  // Credentials from environment variables
  const user = process.env.TEST_USER;
  const pass = process.env.TEST_PASS;
  
  await page.goto('/login');
  await page.fill('[data-testid="email"]', user);
  await page.fill('[data-testid="password"]', pass);
  await page.click('[data-testid="login-button"]');
});

test('admin operations with stored ID', async ({ page }) => {
  const adminId = process.env.ADMIN_ID;
  
  // Navigate to admin with stored ID
  await page.goto(`/admin/users/${adminId}`);
});
```

### CI/CD Integration

**GitHub Actions:**
```yaml
# .github/workflows/test.yml
jobs:
  e2e:
    steps:
      - name: Inject credentials
        run: |
          echo "TEST_USER=${{ secrets.TEST_USER }}" >> $GITHUB_ENV
          echo "TEST_PASS=${{ secrets.TEST_PASS }}" >> $GITHUB_ENV
          echo "ADMIN_ID=${{ secrets.ADMIN_ID }}" >> $GITHUB_ENV
      
      - name: Run tests
        run: npx playwright test
```

**GitLab CI:**
```yaml
test:
  variables:
    TEST_USER: $TEST_USER
    TEST_PASS: $TEST_PASS
  script:
    - npx playwright test
```

### User-Provided Credentials Workflow

When running tests that require user credentials:

**Step 1: Check for stored credentials**
```bash
# Check if credentials exist
if [ -f .env ]; then
  echo "Using stored credentials"
else
  echo "No stored credentials found"
fi
```

**Step 2: Prompt user (if not found)**
```bash
echo "Enter test credentials (will be saved for next run):"
read -p "Test User: " USER
read -s -p "Test Password: " PASS
read -p "Admin ID: " ADMIN_ID

# Save to .env for next run
echo "TEST_USER=$USER" > .env
echo "TEST_PASS=$PASS" >> .env
echo "ADMIN_ID=$ADMIN_ID" >> .env

echo "✅ Credentials saved to .env for future runs"
```

**Step 3: Use in test automation**
```typescript
// Auto-load from .env if exists
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
```

### Security Best Practices

1. **NEVER commit credentials** - Add to `.gitignore`
2. **Use different accounts** - Separate test accounts from production
3. **Rotate credentials** - Update periodically
4. **Limit permissions** - Test accounts should have minimal access
5. **Use secrets manager** - For enterprise, use AWS Secrets Manager, etc.
6. **Encrypt at rest** - If storing locally, consider encrypting

### Regenerate/Update Credentials

```bash
# When credentials expire or change
# 1. Ask user for new credentials
# 2. Update .env file
# 3. Run login test to verify
npx playwright test tests/auth/login.spec.ts

# 4. Re-authenticate if session expired
# Delete old auth state
rm -rf playwright/.auth/
# Run tests to create new session
npx playwright test
```

---

## Integration with Tester Agent

When the `tester` agent runs tests:
1. Use `test-automation` skill for E2E/BDD tests
2. Use unit test frameworks (Jest, Vitest, etc.) for unit tests
3. Prioritize Playwright over Cypress (better cross-browser)
4. Use BDD for acceptance criteria tests
5. Always include `data-testid` attributes in development code
6. Check for stored credentials in `.env` before prompting user