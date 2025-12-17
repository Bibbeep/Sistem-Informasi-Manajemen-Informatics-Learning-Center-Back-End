/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_program_enrollments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            programId: {
                allowNull: true,
                type: Sequelize.INTEGER,
                field: 'program_id',
                references: {
                    model: 'programs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'NO ACTION',
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            status: {
                allowNull: false,
                type: Sequelize.ENUM(
                    'Unpaid',
                    'In Progress',
                    'Completed',
                    'Expired',
                ),
                defaultValue: 'Unpaid',
            },
            progressPercentage: {
                allowNull: false,
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0,
                field: 'progress_percentage',
            },
            completedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                field: 'completed_at',
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
        await queryInterface.dropTable('user_program_enrollments');
    },
};
