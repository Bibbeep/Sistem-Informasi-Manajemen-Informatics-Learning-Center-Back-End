const User = require('../db/models/user');

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
}

module.exports = UserService;
