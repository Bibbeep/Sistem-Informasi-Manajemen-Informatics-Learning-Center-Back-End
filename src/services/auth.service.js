const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { randomBytes, createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const User = require('../db/models/user');
const { redisClient } = require('../configs/redis');
const HTTPError = require('../utils/httpError');
const { sign } = require('../utils/jwtHelper');
const mailer = require('../utils/mailer');

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
        const ttl = exp - Math.floor(Date.now() / 1000);
        const logoutDatetime = new Date(Date.now()).toISOString();

        await redisClient.set(
            `user:${sub}:JWT:${jti}:logoutAt`,
            logoutDatetime,
            {
                expiration: {
                    type: 'EX',
                    value: ttl,
                },
            },
        );
    }

    static async sendResetPasswordMail(data) {
        const { email } = data;

        const isUserExist = await User.findOne({
            where: {
                email,
            },
        });

        if (!isUserExist) {
            return;
        }

        const token = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(token).digest('hex');
        const ttl = 15 * 60;

        await redisClient.set(
            `user:${isUserExist.id}:resetPasswordToken`,
            hashedToken,
            {
                expiration: {
                    type: 'EX',
                    value: ttl,
                },
            },
        );

        const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}&userId=${isUserExist.id}`;

        const templateSource = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'templates',
                'emails',
                'reset-password.hbs',
            ),
            'utf8',
        );

        const template = handlebars.compile(templateSource);
        const html = template({
            fullName: isUserExist.fullName,
            resetUrl,
        });

        await mailer(
            email,
            'Permintaan Reset Password - Informatics Learning Center',
            `Anda telah meminta untuk reset ulang password. Buka tautan ini: ${resetUrl}`,
            html,
        );
    }
}

module.exports = Auth;
