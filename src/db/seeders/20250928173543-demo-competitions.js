/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const competitionPrograms = await Program.findAll({
            where: {
                type: 'Competition',
            },
        });

        const competitions = competitionPrograms.map((program) => {
            const createdAt = faker.date.past();
            const isOnline = faker.datatype.boolean();

            return {
                program_id: program.id,
                is_online: isOnline,
                video_conference_url: isOnline ? faker.internet.url() : null,
                contest_room_url: isOnline ? faker.internet.url() : null,
                location_address: isOnline
                    ? null
                    : faker.location.streetAddress(),
                host_name: faker.company.name(),
                total_prize: faker.number.int({ min: 1000000, max: 50000000 }),
                created_at: createdAt,
                updated_at: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }),
            };
        });

        await queryInterface.bulkInsert('competitions', competitions, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('competitions', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
