/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

async function createUsers() {
    const users = [];

    for (let i = 0; i < 100; i++) {
        const createdAt = faker.date.past();
        const user = {
            email: faker.internet.email(),
            hashed_password: await bcrypt.hash(
                faker.internet.password(),
                await bcrypt.genSalt(10),
            ),
            full_name: faker.person.fullName(),
            member_level: faker.helpers.arrayElement(['Basic', 'Premium']),
            role: i % 2 === 0 ? 'User' : 'Admin',
            picture_url: `${faker.internet.url({ appendSlash: true })}${faker.system.commonFileName(faker.helpers.arrayElement(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']))}`,
            created_at: createdAt,
            updated_at: faker.date.between({
                from: createdAt,
                to: new Date(),
            }),
        };

        users.push(user);
    }

    return users;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('users', await createUsers(), {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
