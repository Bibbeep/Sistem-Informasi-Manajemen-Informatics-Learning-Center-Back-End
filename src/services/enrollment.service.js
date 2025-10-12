const { Op } = require('sequelize');
const { Upload } = require('@aws-sdk/lib-storage');
const {
    Enrollment,
    Program,
    CompletedModule,
    sequelize,
    Invoice,
    Course,
    CourseModule,
    User,
    Certificate,
    Sequelize,
} = require('../db/models');
const HTTPError = require('../utils/httpError');
const printPdf = require('../utils/printPdf');
const { s3 } = require('../configs/s3');

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
        const { programId, userId, admin: isAdmin } = data;
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

        if (program.availableDate > new Date() && !isAdmin) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: 'Program with "programId" is not available yet',
                    context: {
                        key: 'availableDate',
                        value: program.availableDate,
                    },
                },
            ]);
        }

        const existingEnrollment = await Enrollment.findOne({
            include: [
                {
                    model: Invoice,
                    as: 'invoice',
                },
            ],
            where: {
                programId,
                userId,
                [Op.or]: [
                    {
                        status: 'In Progress',
                    },
                    {
                        status: 'Completed',
                    },
                    {
                        status: 'Unpaid',
                        '$invoice.status$': {
                            [Op.eq]: 'Unverified',
                        },
                    },
                ],
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
                        status:
                            program.priceIdr !== 0 ? 'Unpaid' : 'In Progress',
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
                        virtualAccountNumber:
                            program.priceIdr !== 0
                                ? virtualAccountNumber
                                : null,
                        amountIdr: program.priceIdr,
                        paymentDueDatetime:
                            program.priceIdr !== 0
                                ? new Date(
                                      Date.now() + 60 * 60 * 1000,
                                  ).toISOString()
                                : null,
                        status:
                            program.priceIdr !== 0 ? 'Unverified' : 'Verified',
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

    static async updateOne(data) {
        const { enrollmentId, status } = data;

        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                {
                    model: Program,
                    as: 'program',
                    attributes: ['id', 'title', 'type', 'thumbnailUrl'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['fullName'],
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

        if (['Unpaid', 'Completed', 'Expired'].includes(enrollment.status)) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: `Cannot update enrollment with ${enrollment.status} status`,
                    context: {
                        key: 'status',
                        value: enrollment.status,
                    },
                },
            ]);
        }

        if (enrollment.program.type === 'Course') {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: `Cannot update enrollment with ${enrollment.program.type} type`,
                    context: {
                        key: 'type',
                        value: enrollment.program.type,
                    },
                },
            ]);
        }

        const credentialPrefix = {
            Seminar: 'SMN',
            Competition: 'CMP',
            Workshop: 'WRS',
        };

        const title = `${enrollment.program.title} Certificate of Completion`;
        const credential = `${credentialPrefix[enrollment.program.type]}${String(
            enrollment.program.id,
        ).padStart(4, '0')}-U${String(enrollment.userId).padStart(4, '0')}`;

        const fileBuffer = await printPdf(
            {
                title,
                userFullName: enrollment.user.fullName,
                programTitle: enrollment.program.title,
                programType: enrollment.program.type,
                credential,
                issuedAt: new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'long',
                }).format(new Date()),
                expiredAt: null,
            },
            ['..', 'templates', 'documents', 'certificate.hbs'],
        );

        const fileName = `documents/certificates/${credential}-${Date.now().toString()}.pdf`;

        const client = new Upload({
            client: s3,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: 'application/pdf',
                ACL: 'public-read',
            },
        });

        const { Location } = await client.done();
        const payload = {
            enrollmentId,
            userId: enrollment.userId,
            title,
            credential,
            documentUrl: Location,
            issuedAt: new Date(),
        };

        const updatedEnrollment = await sequelize.transaction(async (t) => {
            await Certificate.create(payload, {
                transation: t,
            });

            // eslint-disable-next-line no-unused-vars
            const [updatedCount, updatedRows] = await Enrollment.update(
                {
                    status,
                    progressPercentage: 100,
                    completedAt: new Date(Date.now()),
                },
                {
                    where: {
                        id: enrollmentId,
                    },
                    transaction: t,
                    returning: true,
                },
            );

            return updatedRows[0];
        });

        return {
            id: updatedEnrollment.id,
            userId: updatedEnrollment.userId,
            programId: updatedEnrollment.programId,
            programTitle: enrollment.program.title,
            programType: enrollment.program.type,
            programThumbnailUrl: enrollment.program.thumbnailUrl,
            progressPercentage: updatedEnrollment.progressPercentage,
            status: updatedEnrollment.status,
            completedAt: updatedEnrollment.completedAt,
            createdAt: updatedEnrollment.createdAt,
            updatedAt: updatedEnrollment.updatedAt,
            deletedAt: updatedEnrollment.deletedAt,
        };
    }

    static async deleteOne(enrollmentId) {
        const isEnrollmentExist = await Enrollment.findByPk(enrollmentId);

        if (!isEnrollmentExist) {
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

        await Enrollment.destroy({ where: { id: enrollmentId } });
    }

    static async completeModule(data) {
        const { enrollmentId, courseModuleId } = data;

        const courseModule = await CourseModule.findByPk(courseModuleId);

        if (!courseModule) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Module with "courseModuleId" does not exist',
                    context: {
                        key: 'courseModuleId',
                        value: courseModuleId,
                    },
                },
            ]);
        }

        const enrollment = await Enrollment.findByPk(enrollmentId, {
            include: [
                {
                    model: Program,
                    as: 'program',
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            required: false,
                            attributes: {
                                include: [
                                    [
                                        Sequelize.literal(`
                                            (SELECT COUNT(*) FROM course_modules AS modules WHERE modules.course_id = "program->course".id)
                                        `),
                                        'totalModules',
                                    ],
                                ],
                            },
                        },
                    ],
                },
                {
                    model: CompletedModule,
                    as: 'completedModules',
                    required: false,
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['fullName'],
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

        if (enrollment.program.type !== 'Course') {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: `Cannot add completed module on program with ${enrollment.program.type} type`,
                    context: {
                        key: 'type',
                        value: enrollment.program.type,
                    },
                },
            ]);
        }

        if (['Unpaid', 'Expired'].includes(enrollment.status)) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: `Cannot add completed module with ${enrollment.status} status`,
                    context: {
                        key: 'status',
                        value: enrollment.status,
                    },
                },
            ]);
        }

        if (
            enrollment.completedModules.some((item) => {
                return item.courseModuleId === courseModuleId;
            })
        ) {
            throw new HTTPError(409, 'Resource conflict.', [
                {
                    message: 'Module with "courseModuleId" has been completed',
                    context: {
                        key: 'courseModuleId',
                        value: courseModuleId,
                    },
                },
            ]);
        }

        const { progressPercentage, completedModule } =
            await sequelize.transaction(async (t) => {
                const completedModule = await CompletedModule.create(
                    {
                        enrollmentId,
                        courseModuleId,
                        completedAt: new Date(Date.now()),
                    },
                    {
                        transaction: t,
                    },
                );

                const progressPercentage = (
                    ((enrollment.completedModules.length + 1) /
                        Number(
                            enrollment.program.course.toJSON().totalModules,
                        )) *
                    100
                ).toFixed(2);

                await Enrollment.update(
                    {
                        status:
                            progressPercentage === '100.00'
                                ? 'Completed'
                                : 'In Progress',
                        progressPercentage,
                        completedAt:
                            progressPercentage === '100.00'
                                ? new Date(Date.now())
                                : null,
                    },
                    {
                        where: {
                            id: enrollmentId,
                        },
                        transaction: t,
                    },
                );

                if (progressPercentage === '100.00') {
                    const title = `${enrollment.program.title} Certificate of Completion`;
                    const credential = `CRS${String(
                        enrollment.program.id,
                    ).padStart(
                        4,
                        '0',
                    )}-U${String(enrollment.userId).padStart(4, '0')}`;
                    const now = new Date();

                    const fileBuffer = await printPdf(
                        {
                            title,
                            userFullName: enrollment.user.fullName,
                            programTitle: enrollment.program.title,
                            programType: enrollment.program.type,
                            credential,
                            issuedAt: new Intl.DateTimeFormat('en-US', {
                                dateStyle: 'long',
                            }).format(now),
                            expiredAt: new Intl.DateTimeFormat('en-US', {
                                dateStyle: 'long',
                            }).format(new Date(now).getFullYear() + 3),
                        },
                        ['..', 'templates', 'documents', 'certificate.hbs'],
                    );

                    const fileName = `documents/certificates/${credential}-${Date.now().toString()}.pdf`;

                    const client = new Upload({
                        client: s3,
                        params: {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileName,
                            Body: fileBuffer,
                            ContentType: 'application/pdf',
                            ACL: 'public-read',
                        },
                    });

                    const { Location } = await client.done();
                    const payload = {
                        enrollmentId,
                        userId: enrollment.userId,
                        title,
                        credential,
                        documentUrl: Location,
                        issuedAt: now,
                        expiredAt: new Date(now).getFullYear() + 3,
                    };

                    await Certificate.create(payload, {
                        transaction: t,
                    });
                }

                return {
                    progressPercentage,
                    completedModule,
                };
            });

        return {
            progressPercentage,
            completedModule,
        };
    }
}

module.exports = EnrollmentService;
