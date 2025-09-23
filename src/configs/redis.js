if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { createClient } = require('redis');
const chalk = require('chalk');

const redisClient = createClient({
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASSWORD || null,
    database:
        process.env.NODE_ENV == 'test' ? '15' : process.env.REDIS_DB || '0',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
    },
});

const connectRedis = async () => {
    console.log(chalk.red('[Redis]'), 'Checking database connection...');

    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log(
                chalk.red('[Redis]'),
                'Database connection established',
            );
        }
    } catch (err) {
        console.log(chalk.red('[Redis]'), 'Database connection failed', err);
        process.exit(1);
    }
};

redisClient.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(chalk.red('[Redis]'), 'Client error:', err);
    }

    process.exit(-1);
});

redisClient.on('reconnecting', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(chalk.red('[Redis]'), 'Client reconnecting');
    }
});

module.exports = { redisClient, connectRedis };
