import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
import.meta.env.VITE_API_URL = 'http://localhost:3001/api';
import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';

