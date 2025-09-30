const { Op } = require('sequelize');
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
}

module.exports = ProgramService;
