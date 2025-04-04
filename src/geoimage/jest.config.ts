const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@geoimage/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['/dist/'],
  detectOpenHandles: true,
  testTimeout: 30000,
  transformIgnorePatterns: [
    '/node_modules/(?!(quick-lru|geotiff|@loaders.gl|@deck.gl)/)', // Add packages causing the issue
  ],
};

export default config;