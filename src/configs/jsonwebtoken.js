if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    sign: {
        expiresIn: process.env.JWT_EXP || '7d',
        audience: process.env.CORS_ORIGIN || 'http://localhost',
        issuer: process.env.HOST_NAME || 'http://localhost',
    },
    verify: {
        audience: process.env.CORS_ORIGIN || 'http://localhost',
        issuer: process.env.HOST_NAME || 'http://localhost',
    },
};
