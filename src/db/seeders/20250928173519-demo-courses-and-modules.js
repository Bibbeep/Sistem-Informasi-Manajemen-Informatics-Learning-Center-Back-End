/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { Program, Course } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const coursePrograms = await Program.findAll({
            where: {
                type: 'Course',
            },
        });

        const courses = coursePrograms.map((program) => {
            const createdAt = faker.date.past();
            return {
                program_id: program.id,
                created_at: createdAt,
                updated_at: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }),
            };
        });

        await queryInterface.bulkInsert('courses', courses, {});
        const createdCourses = await Course.findAll();
        const courseModules = [];

        createdCourses.forEach((course) => {
            const moduleCount = faker.number.int({ min: 5, max: 15 });

            for (let i = 1; i <= moduleCount; i++) {
                const createdAt = faker.date.past();

                courseModules.push({
                    course_id: course.id,
                    number_code: i,
                    material_url: `${faker.internet.url({ appendSlash: true })}${faker.system.commonFileName(faker.helpers.arrayElement(['pdf', 'pptx', 'docx', 'xlsx', 'mp4', 'mkv', 'mov']))}`,
                    youtube_url: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
                    markdown_url: faker.internet.url(),
                    created_at: createdAt,
                    updated_at: faker.date.between({
                        from: createdAt,
                        to: new Date(),
                    }),
                });
            }
        });

        await queryInterface.bulkInsert('course_modules', courseModules, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('course_modules', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await queryInterface.bulkDelete('courses', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
