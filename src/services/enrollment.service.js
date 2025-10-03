const { Enrollment, Program } = require('../db/models');

class EnrollmentService {
    static async getMany(data) {
        const { page, limit, sort, programType, status } = data;
        let where = {};

        if (status !== 'all') {
            where.status = status
                .split(' ')
                .map((str) => {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                })
                .join(' ');
        }

        if (data.userId) {
            where.userId = data.userId;
        }

        if (data.programId) {
            where.programId = data.programId;
        }

        let programWhere = {};
        if (programType !== 'all') {
            programWhere.type =
                programType.charAt(0).toUpperCase() + programType.slice(1);
        }

        const { count, rows } = await Enrollment.findAndCountAll({
            where,
            include: [
                {
                    model: Program,
                    as: 'program',
                    where: programWhere,
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: sort.startsWith('-')
                ? [[sort.replace('-', ''), 'DESC']]
                : [[sort, 'ASC']],
        });

        if (rows.length) {
            rows.forEach((enrollment, index) => {
                rows[index] = {
                    id: enrollment.id,
                    userId: enrollment.userId,
                    programId: enrollment.programId,
                    programTitle: enrollment.program.title,
                    programType: enrollment.program.type,
                    programThumbnailUrl: enrollment.program.thumbnailUrl,
                    progressPercentage: enrollment.progressPercentage,
                    status: enrollment.status,
                    completedAt: enrollment.completedAt,
                    createdAt: enrollment.createdAt,
                    updatedAt: enrollment.updatedAt,
                    deletedAt: enrollment.deletedAt,
                };
            });
        }

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
            enrollments: rows,
        };
    }
}

module.exports = EnrollmentService;
