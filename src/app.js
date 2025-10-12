/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morganMiddleware = require('./configs/morgan');
const routes = require('./routes/index.route');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
    app.use(morganMiddleware);
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1', routes);
app.use(errorHandler);

module.exports = { app };
