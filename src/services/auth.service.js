const bcrypt = require('bcrypt');
const User = require('../db/models/user');
const HTTPError = require('../utils/httpError');

class Auth {
    static async register(data) {
        const { fullName, email, password } = data;

        const isUserExist = await User.findOne({
            where: { email },
        });

        if (isUserExist) {
            throw new HTTPError(409, 'Resource conflict', [
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
}

module.exports = Auth;
