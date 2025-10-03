/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program, User } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll();
        const programs = await Program.findAll();
        const enrollments = [];

        users.forEach((user) => {
            const numberOfEnrollments = faker.number.int({ min: 1, max: 5 });
            const shuffledPrograms = faker.helpers.shuffle(programs);

            for (let i = 0; i < numberOfEnrollments; i++) {
                if (shuffledPrograms[i]) {
                    const createdAt = faker.date.past();
                    const status = faker.helpers.arrayElement([
                        'Unpaid',
                        'In Progress',
                    ]);

                    enrollments.push({
                        program_id: shuffledPrograms[i].id,
                        user_id: user.id,
                        status: status,
                        progress_percentage: 0,
                        completed_at: null,
                        created_at: createdAt,
                        updated_at: faker.date.between({
                            from: createdAt,
                            to: new Date(),
                        }),
                    });
                }
            }
        });

        await queryInterface.bulkInsert(
            'user_program_enrollments',
            enrollments,
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_program_enrollments', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
