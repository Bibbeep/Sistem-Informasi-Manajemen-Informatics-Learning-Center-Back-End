/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const workshopPrograms = await Program.findAll({
            where: {
                type: 'Workshop',
            },
        });

        const workshops = workshopPrograms.map((program) => {
            const createdAt = faker.date.past();
            const isOnline = faker.datatype.boolean();

            return {
                program_id: program.id,
                is_online: isOnline,
                video_conference_url: isOnline ? faker.internet.url() : null,
                location_address: isOnline
                    ? null
                    : faker.location.streetAddress(),
                facilitator_names: Array.from(
                    { length: faker.number.int({ min: 1, max: 3 }) },
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

        await queryInterface.bulkInsert('workshops', workshops, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('workshops', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
