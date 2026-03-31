import { test as setup, expect } from '@playwright/test';
import { BASE_URL } from './fixtures';

/**
 * Authentication Setup for E2E Tests
 * Generates unique test user credentials and stores for tests
 */

// Generate unique test user (unique per test RUN, not just per module load)
const timestamp = Date.now();
const rand = Math.random().toString(36).slice(2, 8);
export const TEST_USER_EMAIL = `test.user.${timestamp}.${rand}@example.com`;
export const TEST_USER_PASSWORD = 'TestPass123!';
export const TEST_USER_NAME = `Test User ${timestamp}`;