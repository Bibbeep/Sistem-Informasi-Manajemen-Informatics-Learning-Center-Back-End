const { version, description } = require('../../package.json');
const endpointSchemas = require('../validations/schemas/swagger.json');
const endpointExamples = require('../validations/schemas/swaggerExamples.json');
const endpointPaths = require('../routes/swagger.json');

const swaggerSpec = {
    openapi: '3.1.1',
    info: {
        title: 'Sistem Informasi Manajemen Informatics Learning Center API',
        version,
        description,
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: endpointSchemas,
        examples: endpointExamples,
    },
    servers: [
        {
            url:
                process.env.HOST_NAME !== 'http://localhost'
                    ? process.env.HOST_NAME
                    : `http://localhost:${process.env.PORT}`,
        },
    ],
    basePath: '/api/v1/',
    ...endpointPaths,
};

const swaggerOptions = {
    customSiteTitle: 'SIM ILC API v1 Documentation',
};

module.exports = { swaggerSpec, swaggerOptions };
