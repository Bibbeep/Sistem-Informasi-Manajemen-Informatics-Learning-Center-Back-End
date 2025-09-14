module.exports = {
    projects: [
        // '<rootDir>/jest.unit.config.js',
        // '<rootDir>/jest.integration.config.js',
        {
            displayName: 'integration',
            testMatch: ['**/tests/integrations/*.[jt]s?(x)'],
        },
        {
            displayName: 'unit',
            testMatch: ['**/tests/units/**/*.[jt]s?(x)'],
        },
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/coverage/',
        '/src/configs/',
        '/src/db/',
        '/scripts/',
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
