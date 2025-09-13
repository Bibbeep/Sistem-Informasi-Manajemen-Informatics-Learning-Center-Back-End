const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('./sequelize');

const sequelize = new Sequelize(config[env]);

const connectDb = async () => {
    console.log('[Sequelize] Checking database connection...');

    /* istanbul ignore next */
    try {
        await sequelize.authenticate();
        console.log('[Sequelize] Database connection established');
    } catch (err) {
        console.log('[Sequelize] Database connection failed', err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDb };
