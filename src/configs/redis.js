if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { createClient } = require('redis');

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
    console.log('[Redis] Checking database connection...');

    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('[Redis] Database connection established');
        }
    } catch (err) {
        console.log('[Sequelize] Database connection failed', err);
        process.exit(1);
    }
};

redisClient.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Redis] Client error:', err);
    }

    process.exit(-1);
});

redisClient.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Redis] Database connected');
    }
});

redisClient.on('reconnecting', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Redis] Client reconnecting');
    }
});

redisClient.on('ready', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Redis] Client is ready');
    }
});

module.exports = { redisClient, connectRedis };
