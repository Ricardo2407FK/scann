/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Only transform ESM packages that need it (natural, jsdom dependency chain)
  transformIgnorePatterns: [
    'node_modules/(?!(afinn-165|uuid|@exodus/bytes|html-encoding-sniffer)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/lib/engine/**/*.ts',
    '!src/lib/engine/types.ts',
  ],
};

module.exports = config;
