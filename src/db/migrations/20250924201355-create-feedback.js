/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('feedbacks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            email: {
                allowNull: false,
                type: Sequelize.STRING,
                validate: {
                    isEmail: true,
                },
            },
            fullName: {
                allowNull: false,
                type: Sequelize.STRING,
                field: 'full_name',
            },
            message: {
                allowNull: false,
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('feedbacks');
    },
};
