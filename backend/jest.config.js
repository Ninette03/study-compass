/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        strict: false,
        noImplicitAny: false,
      },
      diagnostics: false, // suppress ts type errors in tests
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@prisma/client$': '<rootDir>/src/__mocks__/@prisma/client.js',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/index.ts',
  ],
};
