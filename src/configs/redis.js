if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { createClient } = require('redis');
const chalk = require('chalk');

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: process.env.NODE_ENV === 'production' ? true : false,
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
    console.error(chalk.red('[Redis]'), 'Client error:', err);
    process.exit(-1);
});

redisClient.on('reconnecting', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(chalk.red('[Redis]'), 'Client reconnecting');
    }
});

module.exports = { redisClient, connectRedis };
