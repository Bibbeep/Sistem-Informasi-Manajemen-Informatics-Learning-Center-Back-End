/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('feedback_responses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            feedbackId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'feedback_id',
                references: {
                    model: 'feedbacks',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            adminUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'admin_user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
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
        await queryInterface.dropTable('feedback_responses');
    },
};
