/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_completed_modules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            courseModuleId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'course_module_id',
                references: {
                    model: 'course_modules',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            enrollmentId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'user_program_enrollment_id',
                references: {
                    model: 'user_program_enrollments',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            completedAt: {
                allowNull: false,
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
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_completed_modules');
    },
};
