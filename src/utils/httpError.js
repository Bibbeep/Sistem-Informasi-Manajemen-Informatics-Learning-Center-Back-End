class HTTPError extends Error {
    /* istanbul ignore next */
    constructor(statusCode, message, details = []) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

module.exports = HTTPError;
