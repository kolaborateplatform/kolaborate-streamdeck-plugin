module.exports = {
    // Specify test environment
    testEnvironment: 'jsdom',
    
    // Configure file extensions Jest should handle
    moduleFileExtensions: ['js', 'json'],
    
    // Configure path mappings
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@helpers/(.*)$': '<rootDir>/tests/extension/helpers/$1'
    },
    
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/tests/extension/setup.js'],
    
    // Test file patterns to match
    testMatch: [
        '<rootDir>/tests/extension/**/*.test.js'
    ],
    
    // Configure coverage collection
    collectCoverageFrom: [
        'chrome-extension/**/*.js',
        '!chrome-extension/dist/**',
        '!**/node_modules/**'
    ],
    
    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
    // Test environment setup
    verbose: true,
    testTimeout: 10000
};