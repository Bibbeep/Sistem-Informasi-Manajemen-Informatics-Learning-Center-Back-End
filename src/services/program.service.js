const { Op } = require('sequelize');
const { fromBuffer } = require('file-type');
const sharp = require('sharp');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const {
    Program,
    Course,
    CourseModule,
    Seminar,
    Workshop,
    Competition,
    sequelize,
} = require('../db/models');
const HTTPError = require('../utils/httpError');
const { s3 } = require('../configs/s3');

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

    static async getOne(programId) {
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

        let details = {};

        if (program.type === 'Course') {
            const course = await program.getCourse({
                include: [
                    {
                        model: CourseModule,
                        as: 'modules',
                    },
                ],
            });

            details = { totalModules: course?.modules?.length || 0 };
        } else if (program.type === 'Workshop') {
            const workshop = await program.getWorkshop();

            details = {
                isOnline: workshop.isOnline,
                videoConferenceUrl: workshop.videoConferenceUrl,
                locationAddress: workshop.locationAddress,
                facilitatorNames: workshop.facilitatorNames,
            };
        } else if (program.type === 'Seminar') {
            const seminar = await program.getSeminar();

            details = {
                isOnline: seminar.isOnline,
                videoConferenceUrl: seminar.videoConferenceUrl,
                locationAddress: seminar.locationAddress,
                speakerNames: seminar.speakerNames,
            };
        } else {
            const competition = await program.getCompetition();

            details = {
                isOnline: competition.isOnline,
                videoConferenceUrl: competition.videoConferenceUrl,
                contestRoomUrl: competition.contestRoomUrl,
                locationAddress: competition.locationAddress,
                hostName: competition.hostName,
                totalPrize: competition.totalPrize,
            };
        }

        const programData = program.toJSON();
        programData.details = details;

        return programData;
    }

    static async create(data) {
        const { title, description, availableDate, type, priceIdr } = data;

        const program = await Program.create({
            title,
            description,
            availableDate,
            type,
            priceIdr,
        });

        let details = {};

        if (['Seminar', 'Workshop', 'Competition'].includes(type)) {
            details = {
                isOnline: data.isOnline,
                videoConferenceUrl: data.videoConferenceUrl,
                locationAddress: data.locationAddress,
            };
        }

        if (type === 'Seminar') {
            const seminarDetails = {
                ...details,
                speakerNames: data.speakerNames,
            };

            await Seminar.create({
                programId: program.id,
                ...seminarDetails,
            });

            details = seminarDetails;
        } else if (type === 'Workshop') {
            const workshopDetails = {
                ...details,
                facilitatorNames: data.facilitatorNames,
            };

            await Workshop.create({
                programId: program.id,
                ...workshopDetails,
            });

            details = workshopDetails;
        } else if (type === 'Competition') {
            const competitionDetails = {
                ...details,
                contestRoomUrl: data.contestRoomUrl,
                hostName: data.hostName,
                totalPrize: data.totalPrize,
            };

            await Competition.create({
                programId: program.id,
                ...competitionDetails,
            });

            details = competitionDetails;
        } else {
            await Course.create({
                programId: program.id,
            });
        }

        return {
            ...program.toJSON(),
            details,
        };
    }

    static async updateOne(data) {
        const { programId, updateData } = data;
        const { type } = updateData;

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

        if (program.type !== type) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: 'Program "type" cannot be changed',
                    context: {
                        key: 'type',
                        value: type,
                    },
                },
            ]);
        }

        const updatedProgram = await sequelize.transaction(async (t) => {
            // eslint-disable-next-line no-unused-vars
            const [programCount, programRows] = await Program.update(
                updateData,
                {
                    where: {
                        id: programId,
                    },
                    returning: true,
                    transaction: t,
                },
            );

            let details = {};

            if (program.type === 'Seminar') {
                details = (
                    await Seminar.update(updateData, {
                        where: {
                            programId,
                        },
                        returning: true,
                        transaction: t,
                    })
                )[1][0].toJSON();
            } else if (program.type === 'Workshop') {
                details = (
                    await Workshop.update(updateData, {
                        where: {
                            programId,
                        },
                        returning: true,
                        transaction: t,
                    })
                )[1][0].toJSON();
            } else if (program.type === 'Competition') {
                details = (
                    await Competition.update(updateData, {
                        where: {
                            programId,
                        },
                        returning: true,
                        transaction: t,
                    })
                )[1][0].toJSON();
            } else {
                details.totalModules = await CourseModule.count({
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            where: {
                                programId,
                            },
                        },
                    ],
                    transaction: t,
                });
            }

            delete details.id;
            delete details.programId;
            delete details.createdAt;
            delete details.updatedAt;
            delete details.deletedAt;

            return {
                ...programRows[0].toJSON(),
                details,
            };
        });

        return updatedProgram;
    }

    static async deleteOne(programId) {
        const isProgramExist = await Program.findByPk(programId);

        if (!isProgramExist) {
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

        await Program.destroy({ where: { id: programId } });
    }

    static async uploadThumbnail(data) {
        if (!data.file) {
            throw new HTTPError(400, 'Validation error.', [
                {
                    message: '"thumbnail" is empty',
                    context: {
                        key: 'thumbnail',
                        value: null,
                    },
                },
            ]);
        }

        const programData = await Program.findByPk(data.programId);

        if (!programData) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Program with "programId" does not exist',
                    context: {
                        key: 'programId',
                        value: data.programId,
                    },
                },
            ]);
        }

        const { file } = data;
        const fileType = await fromBuffer(file.buffer);

        if (
            !fileType ||
            !['image/jpeg', 'image/png', 'image/webp'].includes(fileType.mime)
        ) {
            throw new HTTPError(415, 'Unsupported Media Type.', [
                {
                    message:
                        'File MIME type must be "image/jpeg", "image/png", or "image/webp"',
                    context: {
                        key: 'File MIME Type',
                        value: fileType ? fileType.mime : null,
                    },
                },
            ]);
        }

        const compressedImageBuffer = await sharp(file.buffer)
            .webp({ quality: 40 })
            .toBuffer();

        const fileName = `images/programs/${data.programId}-thumbnail-${Date.now().toString()}.webp`;

        const client = new Upload({
            client: s3,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: compressedImageBuffer,
                ContentType: 'image/webp',
                ACL: 'public-read',
            },
        });

        const { Location } = await client.done();

        if (programData.thumbnailUrl) {
            const oldKey = programData.thumbnailUrl.split('/').pop();

            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `images/programs/${oldKey}`,
                }),
            );
        }

        if (Location) {
            await Program.update(
                { thumbnailUrl: Location },
                {
                    where: {
                        id: data.programId,
                    },
                },
            );
        }

        return {
            thumbnailUrl: Location,
        };
    }

    static async getManyModules(data) {
        const { page, limit, sort, programId } = data;

        const program = await Program.findByPk(programId, {
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: CourseModule,
                            as: 'modules',
                            limit,
                            offset: (page - 1) * limit,
                            order: sort.startsWith('-')
                                ? [[sort.replace('-', ''), 'DESC']]
                                : [[sort, 'ASC']],
                            attributes: {
                                exclude: ['courseId'],
                            },
                        },
                    ],
                },
            ],
        });

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

        const rows = program.course.modules;
        const count = await CourseModule.count({
            where: {
                courseId: program.course.id,
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
            modules: rows,
        };
    }

    static async getOneModule(data) {
        const { programId, moduleId } = data;

        const program = await Program.findByPk(programId, {
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: CourseModule,
                            as: 'modules',
                            where: {
                                id: moduleId,
                            },
                            attributes: {
                                exclude: ['courseId'],
                            },
                        },
                    ],
                },
            ],
        });

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

        if (!program.course) {
            throw new HTTPError(404, 'Resource not found.', [
                {
                    message: 'Module with "moduleId" does not exist',
                    context: {
                        key: 'moduleId',
                        value: moduleId,
                    },
                },
            ]);
        }

        return program.course.modules[0];
    }
}

module.exports = ProgramService;
