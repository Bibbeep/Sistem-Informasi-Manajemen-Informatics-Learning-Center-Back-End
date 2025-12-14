/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const { User } = require('../models');

async function createDiscussions() {
    const adminUsers = await User.findAll({
        where: {
            role: 'Admin',
        },
    });

    if (adminUsers.length === 0) {
        return [];
    }

    const discussions = [];
    for (let i = 0; i < 50; i++) {
        const createdAt = faker.date.past();
        const discussion = {
            admin_user_id: faker.helpers.arrayElement(adminUsers).id,
            title: faker.lorem.sentence(),
            main_content: faker.lorem.paragraphs(),
            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };
        discussions.push(discussion);
    }

    return discussions;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const discussions = await createDiscussions();
        if (discussions.length > 0) {
            await queryInterface.bulkInsert('discussions', discussions, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('discussions', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
