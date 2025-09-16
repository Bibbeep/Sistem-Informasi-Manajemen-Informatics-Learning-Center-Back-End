module.exports = {
    projects: [
        {
            displayName: 'integration',
            testMatch: ['**/tests/integrations/*.[jt]s?(x)'],
        },
        {
            displayName: 'middleware',
            testMatch: ['**/tests/units/middlewares/*.[jt]s?(x)'],
        },
        {
            displayName: 'controller',
            testMatch: ['**/tests/units/controllers/*.[jt]s?(x)'],
        },
        {
            displayName: 'service',
            testMatch: ['**/tests/units/services/*.[jt]s?(x)'],
        },
        {
            displayName: 'utility',
            testMatch: ['**/tests/units/utils/*.[jt]s?(x)'],
        },
        {
            displayName: 'validation',
            testMatch: ['**/tests/units/validations/*.[jt]s?(x)'],
        },
    ],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js', '!src/configs/**', '!src/db/**'],
    coveragePathIgnorePatterns: ['/node_modules/', '/coverage/'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
