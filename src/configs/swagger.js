const swaggerJSDoc = require('swagger-jsdoc');
const { version, description } = require('../../package.json');
const endpointSchemas = require('../validations/schemas/swagger.json');

const options = {
    definition: {
        openapi: '3.1.1',
        info: {
            title: 'Sistem Informasi Manajemen Informatics Learning Center Back End',
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
        },
        servers: [
            {
                url:
                    process.env.HOST_NAME ||
                    `http://localhost:${process.env.PORT}`,
            },
        ],
        produces: ['application/json'],
        schemes: ['https', 'http'],
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
