const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'core/**/*.{ts,tsx}',
    'db/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!core/types_db.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/types/**',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
}

module.exports = createJestConfig(customJestConfig) 