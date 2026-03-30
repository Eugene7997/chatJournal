import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Exclude Playwright test files — those are run via `npx playwright test`
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
}

export default createJestConfig(config)
