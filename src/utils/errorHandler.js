/* eslint-disable no-unused-vars */
const Joi = require('joi');
const HTTPError = require('./httpError');

module.exports = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            data: null,
            message: 'Request body validation error.',
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
    } else if (err instanceof HTTPError) {
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
        console.error(err);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            data: null,
            message: 'There is an issue with the server.',
            errors: null,
        });
    }
};
