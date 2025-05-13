const swaggerJSDoc = require('swagger-jsdoc');
const { version, description } = require('../../package.json');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sistem Informasi Manajemen Informatics Learning Center Back End',
            version,
            description,
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:3000',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
