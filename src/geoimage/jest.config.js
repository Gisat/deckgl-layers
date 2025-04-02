/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/tests'],
    testMatch: [
        '**/?(*.)+(spec|test).[tj]s?(x)', // Matches files ending with .spec.js, .test.js, etc.
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePathIgnorePatterns: ['/dist/'],
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@features/(.*)$': '<rootDir>/src/features/$1',
        '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    },
    detectOpenHandles: true,
    testTimeout: 30000,
};