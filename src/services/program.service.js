const { Program } = require('../db/models');
const { Op } = require('sequelize');

class ProgramService {
    static async getMany(data) {
        const { page, limit, sort, type } = data;
        const where = {};

        if (type != 'all') {
            where.type = type.charAt(0).toUpperCase() + type.slice(1);
        }

        const priceFilter = {};
        priceFilter[Op.gte] = data['price.gte'];

        if (data['price.lte']) {
            priceFilter[Op.lte] = data['price.lte'];
        }

        where.priceIdr = priceFilter;

        const { count, rows } = await Program.findAndCountAll({
            where,
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
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
            programs: rows,
        };
    }
}

module.exports = ProgramService;
