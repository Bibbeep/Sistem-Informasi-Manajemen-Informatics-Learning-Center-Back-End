/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { User } = require('../models');

async function createFeedbackResponses() {
    const adminUsers = await User.findAll({
        where: {
            role: 'Admin',
        },
    });

    const feedbackResponses = [];
    let j = 0;

    for (let i = 1; i <= 100; i += 2) {
        const createdAt = faker.date.past();
        const responses = {
            feedback_id: i,
            admin_user_id: adminUsers[j].id,
            message: faker.lorem.text(),
            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };

        feedbackResponses.push(responses);
        j++;
    }

    return feedbackResponses;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'feedback_responses',
            await createFeedbackResponses(),
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('feedback_responses', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
