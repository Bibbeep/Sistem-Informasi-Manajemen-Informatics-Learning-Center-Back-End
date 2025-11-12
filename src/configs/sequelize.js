if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    development: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        logging: false,
    },
    test: {
        url: 'postgres://postgres:root@localhost:5432/sim_ilc_test',
        dialect: 'postgres',
        logging: false,
    },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    },
};
