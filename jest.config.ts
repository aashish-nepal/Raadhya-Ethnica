import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Loads next.config.js + .env files from the Next.js app root
    dir: './',
});

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    // Runs jest.setup.ts after the test environment (jsdom) is set up
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    // Exclude Playwright E2E tests — those are run via `npx playwright test`
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/src/__tests__/e2e/',
    ],
    // Map the @/ alias to src/
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    // Coverage collection
    collectCoverageFrom: [
        'src/lib/utils.ts',
        'src/components/ui/**/*.{ts,tsx}',
        'src/components/home/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
    ],
};

export default createJestConfig(config);
