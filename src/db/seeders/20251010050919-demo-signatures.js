/* eslint-disable no-unused-vars */
'use strict';
const { fakerID_ID: faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const signatures = [
            {
                is_default: true,
                name: 'Dr. John Doe',
                title: 'CEO of ILC',
                image_url: 'https://www.w3schools.com/tags/img_girl.jpg',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                is_default: false,
                name: 'Dr. Jane Doe',
                title: 'Head of Curriculum',
                image_url: 'https://www.w3schools.com/tags/img_girl.jpg',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        await queryInterface.bulkInsert(
            'certificate_signatures',
            signatures,
            {},
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('certificate_signatures', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
    },
};
