const { Sequelize } = require('sequelize');
const chalk = require('chalk');

const env = process.env.NODE_ENV || 'development';
const config = require('./sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, config[env]);

const connectDb = async () => {
    console.log(chalk.blue('[Sequelize]'), 'Checking database connection...');

    /* istanbul ignore next */
    try {
        await sequelize.authenticate();
        console.log(
            chalk.blue('[Sequelize]'),
            'Database connection established',
        );
    } catch (err) {
        console.log(
            chalk.red('[Sequelize]'),
            'Database connection failed',
            err,
        );
        process.exit(1);
    }
};

module.exports = { sequelize, connectDb };
