if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    development: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        dialect: 'postgres',
        logging: (query) => {
            console.log('[Sequelize]', query);
        },
    },
    test: {
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || null,
        database: 'sim_ilc_test',
        host: '127.0.0.1',
        port: '5432',
        dialect: 'postgres',
        logging: false,
    },
    production: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        dialect: 'postgres',
        logging: false,
    },
};
