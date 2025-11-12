/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');

async function createFeedbacks() {
    const feedbacks = [];

    for (let i = 0; i < 100; i++) {
        const createdAt = faker.date.past();
        const feedback = {
            email: faker.internet.email(),
            full_name: faker.person.fullName(),
            message: faker.lorem.text(),
            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };

        feedbacks.push(feedback);
    }

    return feedbacks;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'feedbacks',
            await createFeedbacks(),
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('feedbacks', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
