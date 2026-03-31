import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const baseOptions = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Exclude Playwright test files — those are run via `npx playwright test`
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
}

// next/jest returns an async function. We post-process it so our specific
// @/ patterns are checked BEFORE next/jest's catch-all @/* mapping.
const customJestConfig = async () => {
  const config = await createJestConfig(baseOptions)()
  return {
    ...config,
    moduleNameMapper: {
      // Specific aliases first — order matters, Jest stops at the first match
      '^@/api/(.*)$': '<rootDir>/src/app/api/$1',
      '^@/components/(.*)$': '<rootDir>/src/components/$1',
      '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
      '^@/pages/(.*)$': '<rootDir>/src/app/$1',
      '^@/(.*)$': '<rootDir>/$1',
      // next/jest's CSS / image / font mappers come after (different patterns)
      ...config.moduleNameMapper,
    },
  }
}

export default customJestConfig