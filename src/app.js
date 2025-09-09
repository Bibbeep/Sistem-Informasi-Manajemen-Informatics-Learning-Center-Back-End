/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index.route');
const errorHandler = require('./utils/errorHandler');
const { sequelize } = require('./db/models');

const app = express();
const connectDb = async () => {
    console.log('Checking database connection...');

    /* istanbul ignore next */
    try {
        await sequelize.authenticate();
        console.log('Database connection established');
    } catch (err) {
        console.log('Database connection failed', err);
        process.exit(1);
    }
};

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
    app.use(morgan('common'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1', routes);
app.use(errorHandler);

module.exports = { app, connectDb };
