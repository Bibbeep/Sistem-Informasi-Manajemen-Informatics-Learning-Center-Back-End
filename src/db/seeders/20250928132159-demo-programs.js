/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');

async function createPrograms() {
    const programs = [];

    for (let i = 0; i < 100; i++) {
        const createdAt = faker.date.past();
        const program = {
            title: faker.word.words({ count: { min: 3, max: 10 } }),
            description: faker.lorem.text(),
            thumbnail_url: faker.internet.url(),
            available_date: faker.date.between({
                from: createdAt,
                to: faker.date.future(),
            }),
            type: faker.helpers.arrayElement([
                'Course',
                'Seminar',
                'Workshop',
                'Competition',
            ]),
            price_idr: faker.number.int({ max: 5000000 }),
            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };

        programs.push(program);
    }

    return programs;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('programs', await createPrograms(), {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('programs', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
