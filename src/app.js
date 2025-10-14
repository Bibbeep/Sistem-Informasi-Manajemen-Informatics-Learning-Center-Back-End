/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morganMiddleware = require('./configs/morgan');
const routes = require('./routes/index.route');
const errorHandler = require('./middlewares/errorHandler.middleware');
const rateLimitConfig = require('./configs/rateLimiter');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(rateLimit(rateLimitConfig));
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
/* istanbul ignore next */
app.get('/health', (req, res) => {
    return res.send('OK');
});
/* istanbul ignore next */
app.use((req, res) => {
    res.redirect(302, '/api/v1/docs');
});
app.use(errorHandler);

module.exports = { app };
