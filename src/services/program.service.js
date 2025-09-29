const { Op } = require('sequelize');
const { Program, CourseModule } = require('../db/models');
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
}

module.exports = ProgramService;
