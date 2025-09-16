const jwt = require('jsonwebtoken');
const jwtOptions = require('../configs/jsonwebtoken');
const { validateTokenPayload } = require('../validations/validator');

module.exports = {
    sign: (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET_KEY, jwtOptions.sign);
    },
    verify: (token) => {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET_KEY,
                jwtOptions.verify,
            );
            const { error } = validateTokenPayload(decoded);

            if (error) {
                return false;
            }

            return decoded;
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            return false;
        }
    },
};
