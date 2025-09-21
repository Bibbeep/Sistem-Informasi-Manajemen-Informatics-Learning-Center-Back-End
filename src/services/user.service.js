const bcrypt = require('bcrypt');
const User = require('../db/models/user');
const HTTPError = require('../utils/httpError');

class UserService {
    static async getMany(data) {
        const { page, limit, sort, role, level } = data;

        const where = {};

        if (role === 'user' || role === 'admin') {
            where.role = role === 'user' ? 'User' : 'Admin';
        }

        if (level === 'basic' || level === 'premium') {
            where.memberLevel = level === 'basic' ? 'Basic' : 'Premium';
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
            attributes: {
                exclude: ['hashedPassword'],
            },
        });

        const totalPages = Math.ceil(count / limit);

        return {
            pagination: {
                currentRecords: rows.length,
                totalRecords: count,
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage:
                    page > totalPages + 1 ? null : page > 1 ? page - 1 : null,
            },
            users: rows,
        };
    }

    static async getOne(userId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: userId,
                    },
                },
            ]);
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            memberLevel: user.memberLevel,
            role: user.role,
            pictureUrl: user.pictureUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static async updateOne(data) {
        const { userId, fullName, email, password } = data;

        if (!(await User.findByPk(userId))) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'User with "userId" does not exist',
                    context: {
                        key: 'userId',
                        value: userId,
                    },
                },
            ]);
        }

        const updateData = {
            ...(fullName && { fullName }),
            ...(email && { email }),
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.hashedPassword = await bcrypt.hash(password, salt);
        }

        // eslint-disable-next-line no-unused-vars
        const [count, rows] = await User.update(updateData, {
            where: {
                id: userId,
            },
            returning: true,
        });

        return {
            id: rows[0].id,
            email: rows[0].email,
            fullName: rows[0].fullName,
            memberLevel: rows[0].memberLevel,
            role: rows[0].role,
            pictureUrl: rows[0].pictureUrl,
            createdAt: rows[0].createdAt,
            updatedAt: rows[0].updatedAt,
        };
    }
}

module.exports = UserService;
