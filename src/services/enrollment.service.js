const {
    Enrollment,
    Program,
    CompletedModule,
    sequelize,
    Invoice,
} = require('../db/models');
const HTTPError = require('../utils/httpError');

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

    static async getOne(enrollmentId) {
        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                {
                    model: CompletedModule,
                    as: 'completedModules',
                    attributes: {
                        exclude: [
                            'id',
                            'enrollmentId',
                            'createdAt',
                            'updatedAt',
                        ],
                    },
                },
                {
                    model: Program,
                    as: 'program',
                },
            ],
        });

        if (!enrollment) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Enrollment with "enrollmentId" does not exist',
                    context: {
                        key: 'enrollmentId',
                        value: enrollmentId,
                    },
                },
            ]);
        }

        const returnValue = {
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

        if (enrollment.program.type === 'Course') {
            returnValue.completedModules = enrollment.completedModules;
        }

        return returnValue;
    }

    static async create(data) {
        const { programId, userId } = data;

        const program = await Program.findByPk(programId);

        if (!program) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: programId,
                    },
                },
            ]);
        }

        const existingEnrollment = await Enrollment.findOne({
            where: {
                programId,
                userId,
            },
        });

        if (existingEnrollment) {
            throw new HTTPError(409, 'Resource conflict.', [
                {
                    message: 'Enrollment for "programId" has already been made',
                    context: {
                        key: 'programId',
                        value: programId,
                    },
                },
            ]);
        }

        const { enrollment, invoice } = await sequelize.transaction(
            async (t) => {
                const enrollment = await Enrollment.create(
                    {
                        programId,
                        userId,
                        status: 'Unpaid',
                        progressPercentage: 0,
                        completedAt: null,
                    },
                    {
                        transaction: t,
                    },
                );

                const virtualAccountNumberLength =
                    Math.floor(Math.random() * 3) + 16;
                let virtualAccountNumber = '';
                for (let i = 0; i < virtualAccountNumberLength; i++) {
                    virtualAccountNumber += Math.floor(Math.random() * 10);
                }

                const invoice = await Invoice.create(
                    {
                        enrollmentId: enrollment.id,
                        virtualAccountNumber,
                        amountIdr: program.priceIdr,
                        paymentDueDatetime: new Date(
                            Date.now() + 60 * 60 * 1000,
                        ).toISOString(),
                        status: 'Unverified',
                    },
                    {
                        transaction: t,
                    },
                );

                return {
                    enrollment,
                    invoice,
                };
            },
        );

        return {
            enrollment: {
                id: enrollment.id,
                userId: enrollment.userId,
                programId: enrollment.programId,
                programTitle: program.title,
                programType: program.type,
                programThumbnailUrl: program.thumbnailUrl,
                progressPercentage: enrollment.progressPercentage,
                status: enrollment.status,
                completedAt: enrollment.completedAt,
                createdAt: enrollment.createdAt,
                updatedAt: enrollment.updatedAt,
                deletedAt: enrollment.deletedAt,
            },
            invoice,
        };
    }
}

module.exports = EnrollmentService;
