import { test as setup, expect } from '@playwright/test';
import { BASE_URL } from './fixtures';

/**
 * Authentication Setup for E2E Tests
 * Generates unique test user credentials and stores for tests
 */

// Generate unique test user
const timestamp = Date.now();
export const TEST_USER_EMAIL = `test.user.${timestamp}@example.com`;
export const TEST_USER_PASSWORD = 'TestPass123!';
export const TEST_USER_NAME = `Test User ${timestamp}`;