/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const seminarPrograms = await Program.findAll({
            where: {
                type: 'Seminar',
            },
        });

        const seminars = seminarPrograms.map((program) => {
            const createdAt = faker.date.past();
            const isOnline = faker.datatype.boolean();

            return {
                program_id: program.id,
                is_online: isOnline,
                video_conference_url: isOnline ? faker.internet.url() : null,
                location_address: isOnline
                    ? null
                    : faker.location.streetAddress(),
                speaker_names: Array.from(
                    { length: faker.number.int({ min: 1, max: 4 }) },
                    () => {
                        return faker.person.fullName();
                    },
                ),
                created_at: createdAt,
                updated_at: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }),
            };
        });

        await queryInterface.bulkInsert('seminars', seminars, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('seminars', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
