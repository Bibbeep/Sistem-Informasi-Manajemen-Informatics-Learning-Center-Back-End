const { version, description } = require('../../package.json');
const swaggerDefinition = require('../swagger.json');

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Sistem Informasi Manajemen Informatics Learning Center API',
        version,
        description,
    },
    tags: [
        {
            name: 'User Authentication',
            description:
                'Endpoints for user registration, login, logout, and password reset. Authentication uses a Bearer JWT token returned on login. Use the token in Authorization header: Bearer <token>.',
        },
        {
            name: 'User Management',
            description:
                "Admin and user profile management. Admins can list, update, and delete any user. Regular users can view and update their own profile. Upload profile photos via multipart/form-data (field 'photo').",
        },
        {
            name: 'Feedback Management',
            description:
                "Public feedback submission and admin responses. Feedback POST is public and accepts JSON body. Admin-only endpoints are protected by Bearer token and role 'admin'.",
        },
        {
            name: 'Program Management',
            description:
                "Programs (course/seminar/workshop/competition) CRUD, modules, thumbnails and materials. Creating/updating programs and modules requires admin role. Thumbnails and materials upload endpoints accept multipart/form-data with fields 'thumbnail' and 'material' respectively. For protected program details, a user must be enrolled or an admin. Note: program listing supports price filters 'price.gte' and 'price.lte' (values in IDR).",
        },
        {
            name: 'Enrollment Management',
            description:
                'Enrollments for users into programs. Self and admin roles apply; certain endpoints require ownership checks. Mark modules as completed via POST to /enrollments/{enrollmentId}/completed-modules with JSON body { moduleId }.',
        },
        {
            name: 'Invoice Management',
            description:
                'Invoice listing and payments. Payments are created via POST to /invoices/{invoiceId}/payments with JSON body describing the payment. Ownership checks enforced for non-admin users.',
        },
        {
            name: 'Certificate Management',
            description:
                'Certificate issuance and retrieval. Admin-only creation and updates; users may retrieve their own certificates. Certificates can be generated as PDF attachments.',
        },
        {
            name: 'Discussion Management',
            description:
                'Forum-style discussion management. Admins create, update, and delete discussion topics; listing and retrieval are available with optional title filters.',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        ...swaggerDefinition.components,
    },
    servers: [
        {
            url:
                process.env.HOST_NAME &&
                process.env.HOST_NAME !== 'http://localhost'
                    ? process.env.HOST_NAME
                    : `http://localhost:${process.env.PORT}`,
        },
    ],
    basePath: '/api/v1/',
    paths: swaggerDefinition.paths,
};

const swaggerOptions = {
    customSiteTitle: 'SIM ILC API v1 Documentation',
};

module.exports = { swaggerSpec, swaggerOptions };
