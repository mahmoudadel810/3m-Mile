/**
 * Jest through `next/jest`: Next's SWC transform compiles TS/TSX and maps the `@/`
 * alias from `tsconfig.json`, so no Babel config and no ts-jest are needed.
 *
 * Every test lives under `src/tests/` (mirrors the API repo's `src/tests/` layout). The
 * default environment is jsdom for component tests; pure lib tests opt into `node` with
 * a `@jest-environment node` docblock.
 */
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  // SWC rewrites `@/` in import statements from tsconfig `paths`, but `jest.mock()`
  // specifiers go through Jest's own resolver — so the alias must be declared here too.
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/lib/**/*.ts', 'src/components/**/*.tsx', '!src/**/*.test.*'],
  coverageDirectory: 'coverage',
};

export default createJestConfig(config);
