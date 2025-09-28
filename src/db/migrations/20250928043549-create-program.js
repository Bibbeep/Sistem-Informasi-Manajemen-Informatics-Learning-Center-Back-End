/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('programs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING(60),
            },
            description: {
                allowNull: false,
                type: Sequelize.TEXT,
            },
            thumbnailUrl: {
                allowNull: true,
                type: Sequelize.TEXT,
                field: 'thumbnail_url',
            },
            availableDate: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                field: 'available_date',
            },
            type: {
                allowNull: false,
                type: Sequelize.ENUM(
                    'Course',
                    'Seminar',
                    'Workshop',
                    'Competition',
                ),
            },
            priceIdr: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'price_idr',
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
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'deleted_at',
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('programs');
    },
};
