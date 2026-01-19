/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('certificate_signatures', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            isDefault: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                field: 'is_default',
                default: false,
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            imageUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'image_url',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('certificate_signatures');
    },
};
