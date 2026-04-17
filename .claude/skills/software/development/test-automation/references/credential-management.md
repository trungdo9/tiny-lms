# Test Credentials Management

Guide for managing test credentials across local, CI/CD, and cloud environments.

## Storage Locations

| Environment | Location | Notes |
|-------------|----------|-------|
| **Local Dev** | `.env` (project root) | Add to `.gitignore` |
| **Local Tests** | `tests/.env` | Scoped to test folder |
| **CI/CD** | GitHub Secrets, GitLab Variables | Injected at runtime |
| **Cloud** | AWS Secrets Manager, GCP Secret Manager | For shared accounts |

## File Structure

```
project/
├── .env                    # Root credentials - NEVER commit
├── .env.example            # Template - safe to commit
├── .gitignore             # Must include .env
└── tests/
    ├── .env              # Test-specific credentials
    └── fixtures/
        └── accounts.json # Encrypted or gitignored
```

## Environment Variables Setup

### 1. Create `.env` (Local)
```bash
# .env - Local development (DO NOT COMMIT)
TEST_USER=admin@example.com
TEST_PASS=SecurePassword123
API_KEY=sk_test_xxx
ADMIN_ID=12345
```

### 2. Create `.env.example` (Template)
```bash
# .env.example - Copy this and fill values
TEST_USER=
TEST_PASS=
API_KEY=
ADMIN_ID=
```

### 3. Update `.gitignore`
```
.env
.env.local
.env.*.local
tests/.env
tests/fixtures/credentials.json
playwright/.auth/
```

## Playwright Integration

### Load Credentials
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test credentials
dotenv.config({ path: path.resolve(__dirname, 'tests/.env') });

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
```

### Use in Tests
```typescript
test('login with stored credentials', async ({ page }) => {
  const user = process.env.TEST_USER;
  const pass = process.env.TEST_PASS;
  
  await page.goto('/login');
  await page.fill('[data-testid="email"]', user);
  await page.fill('[data-testid="password"]', pass);
});
```

## User Credential Workflow

**When running tests without stored credentials:**

```bash
# 1. Check for stored credentials
if [ -f .env ]; then
  echo "✅ Using stored credentials"
else
  # 2. Prompt user
  echo "Enter test credentials:"
  read -p "Test User: " USER
  read -s -p "Password: " PASS
  read -p "Admin ID: " ADMIN_ID
  
  # 3. Save for next run
  echo "TEST_USER=$USER" > .env
  echo "TEST_PASS=$PASS" >> .env
  echo "ADMIN_ID=$ADMIN_ID" >> .env
  echo "✅ Credentials saved!"
fi
```

## CI/CD Integration

### GitHub Actions
```yaml
jobs:
  test:
    steps:
      - name: Inject credentials
        run: |
          echo "TEST_USER=${{ secrets.TEST_USER }}" >> $GITHUB_ENV
          echo "TEST_PASS=${{ secrets.TEST_PASS }}" >> $GITHUB_ENV
```

### GitLab CI
```yaml
test:
  variables:
    TEST_USER: $TEST_USER
  script:
    - npx playwright test
```

## Security Rules

1. **NEVER commit** - Always add `.env` to `.gitignore`
2. **Separate accounts** - Use dedicated test accounts
3. **Rotate credentials** - Update periodically
4. **Minimal permissions** - Test accounts need only test data access
5. **Use secrets manager** - For enterprise, use AWS/GCP secrets