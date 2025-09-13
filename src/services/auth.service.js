const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../db/models/user');
const HTTPError = require('../utils/httpError');
const { sign } = require('../utils/jwtHelper');

class Auth {
    static async register(data) {
        const { fullName, email, password } = data;

        const isUserExist = await User.findOne({ where: { email } });

        if (isUserExist) {
            throw new HTTPError(409, 'Resource conflict.', [
                {
                    message: 'email is already registered.',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
            ]);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            hashedPassword,
            fullName,
            memberLevel: 'Basic',
            role: 'User',
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                memberLevel: user.memberLevel,
                role: user.role,
                pictureUrl: user.pictureUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }

    static async login(data) {
        const { email, password } = data;

        const userData = await User.findOne({ where: { email } });

        if (
            !userData ||
            !(await bcrypt.compare(password, userData.hashedPassword))
        ) {
            throw new HTTPError(401, 'Unauthorized.', [
                {
                    message: 'Wrong email or password.',
                    context: {
                        key: 'email',
                        value: email,
                    },
                },
                {
                    message: 'Wrong email or password.',
                    context: {
                        key: 'password',
                        value: '*'.repeat(password.length),
                    },
                },
            ]);
        }

        const jwtPayload = {
            sub: userData.id,
            admin: userData.role == 'Admin' ? true : false,
            jti: uuidv4(),
        };

        const accessToken = sign(jwtPayload);

        return {
            accessToken,
        };
    }

    static async logout(data) {
        const { sub, exp, jti } = data;

        //
    }
}

module.exports = Auth;
