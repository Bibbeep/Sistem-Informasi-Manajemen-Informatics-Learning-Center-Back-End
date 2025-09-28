/* eslint-disable no-unused-vars */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('courses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            programId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                field: 'program_id',
                references: {
                    model: 'programs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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
        await queryInterface.dropTable('courses');
    },
};
