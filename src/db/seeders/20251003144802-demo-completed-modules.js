/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Enrollment, CourseModule, Program, Course } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const enrollments = await Enrollment.findAll({
            where: {
                status: 'In Progress',
            },
            include: [
                {
                    model: Program,
                    as: 'program',
                    where: {
                        type: 'Course',
                    },
                    include: [
                        {
                            model: Course,
                            as: 'course',
                        },
                    ],
                },
            ],
        });

        const completedModules = [];

        for (const enrollment of enrollments) {
            const courseId = enrollment.program.course.id;
            const modules = await CourseModule.findAll({
                where: { courseId: courseId },
            });
            const modulesToCompleteCount = faker.number.int({
                min: 0,
                max: modules.length,
            });
            const shuffledModules = faker.helpers.shuffle(modules);

            for (let i = 0; i < modulesToCompleteCount; i++) {
                completedModules.push({
                    course_module_id: shuffledModules[i].id,
                    user_program_enrollment_id: enrollment.id,
                    completed_at: faker.date.past({
                        refDate: enrollment.createdAt,
                    }),
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            const progressPercentage = (
                (modulesToCompleteCount / modules.length) *
                100
            ).toFixed(2);
            await enrollment.update({
                progressPercentage,
                status: progressPercentage == 100 ? 'Completed' : 'In Progress',
                completedAt: progressPercentage == 100 ? new Date() : null,
            });
        }

        if (completedModules.length > 0) {
            await queryInterface.bulkInsert(
                'user_completed_modules',
                completedModules,
                {},
            );
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('user_completed_modules', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
