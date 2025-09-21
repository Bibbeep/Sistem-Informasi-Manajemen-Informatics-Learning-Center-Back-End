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
}

module.exports = UserService;
