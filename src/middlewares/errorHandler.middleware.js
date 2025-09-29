/* eslint-disable no-unused-vars */
const Joi = require('joi');
const { MulterError } = require('multer');
const HTTPError = require('../utils/httpError');

module.exports = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        /* istanbul ignore next */
        return res.status(400).json({
            success: false,
            statusCode: 400,
            data: null,
            message: 'Validation error.',
            errors: err.details.length
                ? err.details.map((e) => {
                      return {
                          message: e.message,
                          context: {
                              key: e.context.key,
                              value: e.context.value,
                          },
                      };
                  })
                : [],
        });
    } else if (err instanceof MulterError) {
        const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;

        /* istanbul ignore next */
        return res.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            data: null,
            message:
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'Content Too Large.'
                    : 'Validation error.',
            errors: {
                message: err.message,
                context: {
                    key: err.field || 'file',
                    value: null,
                },
            },
        });
    } else if (err instanceof HTTPError) {
        /* istanbul ignore next */
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            data: null,
            message: err.message,
            errors: err.details.length
                ? err.details.map((e) => {
                      return {
                          message: e.message,
                          context: {
                              key: e.context.key,
                              value: e.context.value || null,
                          },
                      };
                  })
                : null,
        });
    } else {
        /* istanbul ignore next */
        if (process.env.NODE_ENV == 'development') {
            console.error(err);
        }

        // console.log('500 Error ==>', err);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            data: null,
            message: 'There is an issue with the server.',
            errors: null,
        });
    }
};
