/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program, User } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll();
        const programs = await Program.findAll();
        const enrollments = new Set();

        users.forEach((user) => {
            const numberOfEnrollments = faker.number.int({ min: 1, max: 5 });
            const shuffledPrograms = faker.helpers.shuffle(programs);

            for (let i = 0; i < numberOfEnrollments; i++) {
                const program = shuffledPrograms[i];
                if (program) {
                    const enrollmentKey = `${user.id}-${program.id}`;
                    if (!enrollments.has(enrollmentKey)) {
                        const createdAt = faker.date.past();
                        const status =
                            program.type === 'Course'
                                ? 'In Progress'
                                : faker.helpers.arrayElement([
                                      'In Progress',
                                      'Completed',
                                  ]);

                        enrollments.add({
                            program_id: program.id,
                            user_id: user.id,
                            status,
                            progress_percentage:
                                status === 'Completed' ? 100 : 0,
                            completed_at:
                                status === 'Completed' ? new Date() : null,
                            created_at: createdAt,
                            updated_at: faker.date.between({
                                from: createdAt,
                                to: new Date(),
                            }),
                        });
                        enrollments.add(enrollmentKey);
                    }
                }
            }
        });

        await queryInterface.bulkInsert(
            'user_program_enrollments',
            [...enrollments].filter((item) => {
                return typeof item === 'object';
            }),
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
