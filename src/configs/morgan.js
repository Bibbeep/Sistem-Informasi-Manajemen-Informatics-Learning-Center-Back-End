const morgan = require('morgan');
const chalk = require('chalk');

/**
 * @description Morgan middleware with a custom format function for colorful logs
 */
const morganMiddleware = morgan((tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = tokens['response-time'](req, res);

    const methodColor =
        method === 'GET'
            ? 'blue'
            : method === 'POST'
              ? 'green'
              : method === 'PUT'
                ? 'yellow'
                : method === 'DELETE'
                  ? 'red'
                  : 'white';

    const statusColor =
        status >= 500
            ? 'red'
            : status >= 400
              ? 'yellow'
              : status >= 300
                ? 'cyan'
                : 'green';

    return [
        chalk[methodColor].bold(method),
        chalk.white(url),
        chalk[statusColor].bold(status),
        chalk.yellow(`${responseTime} ms`),
    ].join(' ');
});

module.exports = morganMiddleware;
